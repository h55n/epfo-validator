/**
 * Structured audit logger.
 *
 * Writes JSON-line events to stdout — Vercel captures these in Function Logs.
 * No external dependency needed.
 *
 * Usage:
 *   import { audit } from './_lib/auditLog.js'
 *   audit('AUTH_SUCCESS', { uan: '...', ip: '...' })
 *
 * Events:
 *   AUTH_SUCCESS    — user logged in
 *   AUTH_FAIL       — bad credentials
 *   AUTH_LOGOUT     — user logged out
 *   AI_REQUEST      — AI endpoint called
 *   AI_SUCCESS      — AI response returned
 *   AI_FAIL         — upstream AI error or schema mismatch
 *   RATE_LIMITED    — request blocked by rate limiter
 */

const VALID_EVENTS = new Set([
  'AUTH_SUCCESS', 'AUTH_FAIL', 'AUTH_LOGOUT',
  'AI_REQUEST', 'AI_SUCCESS', 'AI_FAIL',
  'RATE_LIMITED',
])

/**
 * @param {string} event   One of the constants above
 * @param {object} [meta]  Structured data — never include passwords or API keys
 */
export function audit(event, meta = {}) {
  if (!VALID_EVENTS.has(event)) return // silently ignore unknown events

  const entry = {
    t:     new Date().toISOString(),
    event,
    ...sanitize(meta),
  }

  // console.log goes to Vercel Function Logs as structured output
  console.log(JSON.stringify(entry))
}

/** Strip known sensitive field names before logging */
function sanitize(obj) {
  const BANNED = new Set(['password', 'token', 'apiKey', 'api_key', 'secret', 'cookie'])
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (BANNED.has(k)) out[k] = '[REDACTED]'
    else if (typeof v === 'object' && v !== null) out[k] = sanitize(v)
    else out[k] = v
  }
  return out
}
