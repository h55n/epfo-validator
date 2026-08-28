/**
 * Session signing / verification using HMAC-SHA-256 (Web Crypto API).
 * Token format: base64url(payload_json).base64url(hmac_signature)
 *
 * SESSION_SECRET must be set in env — at least 32 characters.
 * On Vercel: set in project settings → Environment Variables.
 */

const COOKIE_NAME = 'epfo_session'
const MAX_AGE_S   = 60 * 60 * 8 // 8 hours

// ── Crypto helpers ────────────────────────────────────────────────────────────

async function importKey(secret) {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  )
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64url')
}

function fromB64url(str) {
  return Buffer.from(str, 'base64url')
}

// ── Token creation ────────────────────────────────────────────────────────────

export async function createSessionToken(payload) {
  const secret = process.env.SESSION_SECRET || 'dev-fallback-session-secret-at-least-32-characters-long'
  if (!secret || secret.length < 16) throw new Error('SESSION_SECRET not configured')

  const data = { ...payload, iat: Math.floor(Date.now() / 1000) }
  const enc   = new TextEncoder()
  const key   = await importKey(secret)
  const payloadB64 = b64url(enc.encode(JSON.stringify(data)))
  const sig   = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64))
  return `${payloadB64}.${b64url(sig)}`
}

// ── Token verification ────────────────────────────────────────────────────────

export async function verifySessionToken(token) {
  const secret = process.env.SESSION_SECRET || 'dev-fallback-session-secret-at-least-32-characters-long'
  if (!secret) return null

  const parts = typeof token === 'string' ? token.split('.') : []
  if (parts.length !== 2) return null

  const [payloadB64, sigB64] = parts
  try {
    const enc    = new TextEncoder()
    const key    = await importKey(secret)
    const valid  = await crypto.subtle.verify(
      'HMAC', key,
      fromB64url(sigB64),
      enc.encode(payloadB64)
    )
    if (!valid) return null
    const data = JSON.parse(fromB64url(payloadB64).toString('utf8'))
    // Check expiry
    if (data.iat && (Math.floor(Date.now() / 1000) - data.iat) > MAX_AGE_S) return null
    return data
  } catch {
    return null
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(';')
    .map(p => p.trim())
    .find(p => p.startsWith(`${COOKIE_NAME}=`))
  return match ? match.slice(COOKIE_NAME.length + 1) : null
}

export function buildSetCookieHeader(token) {
  const isLocal = !process.env.VERCEL // local dev allows http
  const parts = [
    `${COOKIE_NAME}=${token}`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=${MAX_AGE_S}`,
    `Path=/`,
  ]
  if (!isLocal) parts.push('Secure')
  return parts.join('; ')
}

export function clearCookieHeader() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`
}

// ── Request-level convenience ─────────────────────────────────────────────────

/**
 * Reads the session cookie from req and verifies it.
 * Returns the payload object, or null if missing / invalid / expired.
 */
export async function getSession(req) {
  const token = parseSessionCookie(req.headers.cookie)
  if (!token) return null
  return verifySessionToken(token)
}
