import { getSession }   from '../_lib/session.js'
import { findUserByUAN } from '../_lib/users.js'

/**
 * GET /api/auth/me
 *
 * Validates the session cookie and returns the current user object.
 * Called on app boot to rehydrate auth state after a page refresh.
 *
 * 200 → { ok: true, user }
 * 401 → { ok: false }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getSession(req)
  if (!session?.uan) {
    return res.status(401).json({ ok: false })
  }

  const user = findUserByUAN(session.uan)
  if (!user) {
    return res.status(401).json({ ok: false })
  }

  return res.status(200).json({ ok: true, user })
}
