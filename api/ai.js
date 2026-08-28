/**
 * POST /api/ai
 *
 * Proxies prompts to an AI provider server-side so no API key is ever
 * exposed in the browser bundle.
 *
 * Security controls:
 *   • Session auth — rejects unauthenticated requests (401)
 *   • Rate limit   — 10 calls per user per minute (429)
 *   • Input guards — prompt string and length validation
 *   • Provider timeout — 8-second AbortController
 *   • Schema validation — JSON-mode responses are validated before returning
 *   • Audit logging — every request + outcome is recorded
 *   • Human-review fallback header — X-AI-Fallback: true when AI is unavailable
 */

import { getSession }           from './_lib/session.js'
import { checkRateLimit, getClientIp } from './_lib/rateLimit.js'
import { audit }                from './_lib/auditLog.js'

// ── Provider registry ─────────────────────────────────────────────────────────

const PROVIDERS = {
  anthropic:  { baseUrl: 'https://api.anthropic.com',         endpoint: '/v1/messages',            model: 'claude-sonnet-4-6',              format: 'anthropic' },
  openai:     { baseUrl: 'https://api.openai.com',            endpoint: '/v1/chat/completions',     model: 'gpt-4o-mini',                    format: 'openai' },
  mistral:    { baseUrl: 'https://api.mistral.ai',            endpoint: '/v1/chat/completions',     model: 'mistral-small-latest',           format: 'openai' },
  groq:       { baseUrl: 'https://api.groq.com/openai',       endpoint: '/v1/chat/completions',     model: 'llama-3.1-8b-instant',           format: 'openai' },
  together:   { baseUrl: 'https://api.together.xyz',          endpoint: '/v1/chat/completions',     model: 'meta-llama/Llama-3-8b-chat-hf',  format: 'openai' },
  openrouter: { baseUrl: 'https://openrouter.ai/api',         endpoint: '/v1/chat/completions',     model: 'mistralai/mistral-7b-instruct',  format: 'openai' },
  deepseek:   { baseUrl: 'https://api.deepseek.com',          endpoint: '/v1/chat/completions',     model: 'deepseek-chat',                  format: 'openai' },
}

function getProviderConfig() {
  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase()
  const spec = PROVIDERS[provider]
  if (!spec) return null
  return {
    spec,
    apiKey: process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
    model:  process.env.AI_MODEL || spec.model,
  }
}

// ── JSON schema validator ─────────────────────────────────────────────────────

const NAME_MATCH_SCHEMA = ['isMatch', 'confidence', 'severity', 'mismatchType', 'explanation', 'hindiExplanation', 'resolution']

function validateSchema(parsed, expectedKeys) {
  if (typeof parsed !== 'object' || parsed === null) return false
  return expectedKeys.every(k => k in parsed)
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const start = Date.now()

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── Auth guard ─────────────────────────────────────────────────────────────
  const session = await getSession(req)
  if (!session?.uan) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // ── Rate limit: 10 AI calls per user per minute (relaxed in dev/test) ────
  const ip = getClientIp(req)
  const isTestOrDev = process.env.NODE_ENV === 'test' || !process.env.VERCEL
  const maxAiCalls = isTestOrDev ? 1000 : (Number(process.env.RATE_LIMIT_AI_MAX) || 10)
  const rl = checkRateLimit('ai', session.uan, { max: maxAiCalls, windowMs: 60_000 })
  if (!rl.allowed) {
    audit('RATE_LIMITED', { namespace: 'ai', uan: session.uan, ip })
    res.setHeader('Retry-After', String(Math.ceil(rl.resetMs / 1000)))
    return res.status(429).json({ error: rl.message })
  }

  // ── Input validation ───────────────────────────────────────────────────────
  const { prompt, maxTokens = 800, expectSchema } = req.body || {}

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt must be a non-empty string' })
  }
  if (prompt.length > 12000) {
    return res.status(400).json({ error: 'prompt exceeds maximum length' })
  }

  // ── Provider config ────────────────────────────────────────────────────────
  const active = getProviderConfig()
  if (!active?.apiKey) {
    audit('AI_FAIL', { reason: 'no_api_key', uan: session.uan })
    res.setHeader('X-AI-Fallback', 'true')
    return res.status(503).json({ error: 'AI service unavailable', fallback: true })
  }

  const { spec, apiKey, model } = active
  const tokenLimit = Math.min(Math.max(Number(maxTokens) || 800, 1), 1000)

  // ── Build request ──────────────────────────────────────────────────────────
  const headers = { 'Content-Type': 'application/json' }
  const body    = { model, max_tokens: tokenLimit, messages: [{ role: 'user', content: prompt }] }

  if (spec.format === 'anthropic') {
    headers['x-api-key']          = apiKey
    headers['anthropic-version']  = '2023-06-01'
  } else {
    headers.Authorization = `Bearer ${apiKey}`
  }

  audit('AI_REQUEST', { uan: session.uan, provider: process.env.AI_PROVIDER || 'anthropic', tokenLimit })

  // ── Upstream fetch with 8-second timeout ──────────────────────────────────
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 8000)

  try {
    const upstream = await fetch(`${spec.baseUrl}${spec.endpoint}`, {
      method: 'POST', headers, body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '')
      audit('AI_FAIL', { uan: session.uan, status: upstream.status, body: errBody.slice(0, 200) })
      res.setHeader('X-AI-Fallback', 'true')
      return res.status(502).json({ error: 'AI provider request failed', fallback: true })
    }

    const data = await upstream.json()
    const text = spec.format === 'anthropic'
      ? data?.content?.[0]?.text
      : data?.choices?.[0]?.message?.content

    if (typeof text !== 'string' || !text.trim()) {
      audit('AI_FAIL', { uan: session.uan, reason: 'empty_response' })
      res.setHeader('X-AI-Fallback', 'true')
      return res.status(502).json({ error: 'AI provider returned no text', fallback: true })
    }

    // ── Schema validation (optional, for JSON-mode calls) ─────────────────
    if (expectSchema === 'nameMatch') {
      const cleaned = text
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
      try {
        const parsed = JSON.parse(cleaned)
        if (!validateSchema(parsed, NAME_MATCH_SCHEMA)) {
          audit('AI_FAIL', { uan: session.uan, reason: 'schema_mismatch', expectSchema })
          res.setHeader('X-AI-Fallback', 'true')
          return res.status(200).json({ text, schemaValid: false, fallback: true })
        }
      } catch {
        audit('AI_FAIL', { uan: session.uan, reason: 'json_parse_error', expectSchema })
        res.setHeader('X-AI-Fallback', 'true')
        return res.status(200).json({ text, schemaValid: false, fallback: true })
      }
    }

    const latencyMs = Date.now() - start
    audit('AI_SUCCESS', { uan: session.uan, latencyMs, textLen: text.length })

    return res.status(200).json({ text, schemaValid: true })
  } catch (err) {
    clearTimeout(timeoutId)
    const isTimeout = err?.name === 'AbortError'
    audit('AI_FAIL', { uan: session.uan, reason: isTimeout ? 'timeout' : 'network_error' })
    res.setHeader('X-AI-Fallback', 'true')
    return res.status(502).json({
      error: isTimeout ? 'AI provider timed out' : 'AI provider unavailable',
      fallback: true,
    })
  }
}
