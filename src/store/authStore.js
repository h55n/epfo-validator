/**
 * Auth store — backed by real server-side session endpoints.
 *
 * No mock data, no passwords, no sensitive data in client-side state.
 * The session lives in an HttpOnly cookie managed by the server.
 *
 * Lifecycle:
 *   1. App mounts → checkSession() called → GET /api/auth/me
 *      • Cookie valid  → populate currentUser, isAuthenticated = true
 *      • Cookie gone   → stay logged out (no redirect — let ProtectedRoute handle it)
 *   2. User logs in   → login(uan, password) → POST /api/auth/login
 *   3. User logs out  → logout() → POST /api/auth/logout → clear state
 */

import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  currentUser:     null,
  isAuthenticated: false,
  sessionChecked:  false, // true once /api/auth/me has been called (success or fail)

  /** Rehydrate session on app boot. Must be called once from App.jsx. */
  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const { user } = await res.json()
        set({ currentUser: user, isAuthenticated: true, sessionChecked: true })
      } else {
        set({ sessionChecked: true })
      }
    } catch {
      set({ sessionChecked: true })
    }
  },

  /**
   * Authenticate with UAN + password.
   * Returns { success: true, user } or { success: false, error: string }
   */
  login: async (uan, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ uan: uan?.trim(), password }),
      })

      const data = await res.json()

      if (res.ok && data.ok) {
        set({ currentUser: data.user, isAuthenticated: true })
        return { success: true, user: data.user }
      }

      // 429 rate-limited — surface the real message
      if (res.status === 429) {
        return { success: false, error: data.error || 'Too many attempts. Please wait.' }
      }

      return { success: false, error: data.error || 'Invalid UAN or password.' }
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  },

  /** Sign out — clears the server-side cookie and local state. */
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch { /* best effort */ }
    set({ currentUser: null, isAuthenticated: false })
  },
}))
