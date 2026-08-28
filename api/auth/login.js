import { authenticateUser }                     from '../_lib/users.js'
import { createSessionToken, buildSetCookieHeader } from '../_lib/session.js'
import { checkRateLimit, getClientIp }          from '../_lib/rateLimit.js'
import { audit }                                from '../_lib/auditLog.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)

  // ── Rate limit: 5 attempts per IP per 15 minutes (relaxed in dev/test) ─────
  const isTestOrDev = process.env.NODE_ENV === 'test' || !process.env.VERCEL
  const maxAttempts = isTestOrDev ? 1000 : (Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5)
  const rl = checkRateLimit('login', ip, { max: maxAttempts, windowMs: 15 * 60 * 1000 })
  if (!rl.allowed) {
    audit('RATE_LIMITED', { namespace: 'login', ip })
    res.setHeader('Retry-After', String(Math.ceil(rl.resetMs / 1000)))
    return res.status(429).json({ error: rl.message })
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const { uan, password } = req.body || {}

  if (typeof uan !== 'string' || !/^\d{12}$/.test(uan.trim())) {
    return res.status(400).json({ error: 'UAN must be a 12-digit number.' })
  }
  if (typeof password !== 'string' || password.length < 4 || password.length > 128) {
    return res.status(400).json({ error: 'Invalid password.' })
  }

  // ── Authenticate ──────────────────────────────────────────────────────────
  const user = await authenticateUser(uan.trim(), password)

  if (!user) {
    audit('AUTH_FAIL', { uan: uan.trim(), ip })
    // Return the same message for wrong UAN or wrong password (enumeration prevention)
    return res.status(401).json({ error: 'Invalid UAN or password.' })
  }

  // ── Create session ────────────────────────────────────────────────────────
  const token = await createSessionToken({ uan: user.uan, id: user.id })
  const cookie = buildSetCookieHeader(token)

  audit('AUTH_SUCCESS', { uan: user.uan, id: user.id, ip })

  res.setHeader('Set-Cookie', cookie)
  return res.status(200).json({ ok: true, user })
}
