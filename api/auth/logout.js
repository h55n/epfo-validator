import { clearCookieHeader } from '../_lib/session.js'
import { getSession }        from '../_lib/session.js'
import { audit }             from '../_lib/auditLog.js'

/**
 * POST /api/auth/logout
 *
 * Clears the session cookie. Always returns 200 — idempotent.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Best-effort audit — session may already be gone
  try {
    const session = await getSession(req)
    if (session?.uan) audit('AUTH_LOGOUT', { uan: session.uan })
  } catch { /* ignore */ }

  res.setHeader('Set-Cookie', clearCookieHeader())
  return res.status(200).json({ ok: true })
}
