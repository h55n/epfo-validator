/**
 * Browser-side AI adapter.
 *
 * All calls are proxied through /api/ai so no provider key is ever
 * exposed in the browser bundle.
 *
 * The adapter:
 *   • Sends credentials (session cookie) with every request
 *   • Detects the X-AI-Fallback header and exposes it to callers
 *   • Passes expectSchema for server-side JSON schema validation
 *   • Returns null on any error so callers fall back deterministically
 */

const PROVIDER_LABELS = {
  anthropic: 'Claude (Anthropic)', openai: 'OpenAI', mistral: 'Mistral AI',
  groq: 'Groq', together: 'Together AI', openrouter: 'OpenRouter',
  cohere: 'Cohere', deepseek: 'DeepSeek', ollama: 'Ollama (local)', custom: 'AI service',
}

function getPublicConfig() {
  const provider = (import.meta.env.VITE_AI_PROVIDER || 'anthropic').toLowerCase().trim()
  return { provider, label: PROVIDER_LABELS[provider] || 'AI service' }
}

/**
 * Call the server-side AI proxy.
 *
 * @param {string} prompt
 * @param {{ maxTokens?: number, json?: boolean, expectSchema?: string }} [options]
 * @returns {Promise<string | object | null>}
 *   - string if json=false
 *   - parsed object if json=true and parse succeeds
 *   - null on any error (caller should use deterministic fallback)
 */
export async function callAI(prompt, options = {}) {
  const { maxTokens = 800, json = false, expectSchema } = options

  try {
    const response = await fetch('/api/ai', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include', // send session cookie
      body:        JSON.stringify({
        prompt,
        maxTokens:    Math.min(Math.max(maxTokens, 1), 1000),
        expectSchema: expectSchema || undefined,
      }),
    })

    // 401 → not logged in; 429 → rate-limited — both return null so caller falls back
    if (!response.ok) return null

    const data = await response.json()

    // If server flagged a fallback (timeout, schema mismatch, etc.), return null
    if (data?.fallback) return null

    const text = typeof data?.text === 'string' ? data.text.trim() : ''
    if (!text) return null

    if (!json) return text

    // JSON mode: strip markdown fences then parse
    const cleaned = text
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
    try { return JSON.parse(cleaned) } catch { return null }
  } catch {
    return null
  }
}

export function getProviderInfo() {
  const { provider, label } = getPublicConfig()
  return { provider, label, ready: true }
}
