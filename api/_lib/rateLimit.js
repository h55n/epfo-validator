/**
 * In-memory sliding-window rate limiter.
 *
 * Tracks attempts per key (IP address, UAN, etc.) in a Map.
 * Safe for single-instance serverless functions; does NOT persist
 * across cold starts. For multi-region production, swap the Map
 * for Upstash Redis (see README).
 *
 * Usage:
 *   import { checkRateLimit } from './_lib/rateLimit.js'
 *   const result = checkRateLimit('login', ip, { max: 5, windowMs: 15 * 60 * 1000 })
 *   if (!result.allowed) return res.status(429).json({ error: result.message })
 */

// namespace → key → Array<timestamp>
const store = new Map()

/**
 * @param {string} namespace  e.g. 'login', 'ai'
 * @param {string} key        e.g. IP address or UAN
 * @param {{ max?: number, windowMs?: number }} opts
 * @returns {{ allowed: boolean, remaining: number, resetMs: number, message?: string }}
 */
export function checkRateLimit(namespace, key, opts = {}) {
  const max      = opts.max ?? (Number(process.env.RATE_LIMIT_MAX) || 10)
  const windowMs = opts.windowMs ?? (Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000)

  const storeKey = `${namespace}:${key}`
  const now      = Date.now()
  const cutoff   = now - windowMs

  // Retrieve and prune old entries
  let timestamps = (store.get(storeKey) || []).filter(t => t > cutoff)

  if (timestamps.length >= max) {
    const resetMs = timestamps[0] + windowMs - now
    return {
      allowed:   false,
      remaining: 0,
      resetMs,
      message:   `Too many requests. Try again in ${Math.ceil(resetMs / 1000)} seconds.`,
    }
  }

  timestamps.push(now)
  store.set(storeKey, timestamps)

  // Periodic cleanup to avoid unbounded growth
  if (store.size > 5000) pruneStore(cutoff)

  return {
    allowed:   true,
    remaining: max - timestamps.length,
    resetMs:   0,
  }
}

function pruneStore(cutoff) {
  for (const [k, ts] of store.entries()) {
    const fresh = ts.filter(t => t > cutoff)
    if (fresh.length === 0) store.delete(k)
    else store.set(k, fresh)
  }
}

/** Helper: extract the best available client IP from a Vercel request. */
export function getClientIp(req) {
  return (
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}
