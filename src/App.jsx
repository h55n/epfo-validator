import { useEffect }                                     from 'react'
import { BrowserRouter, Routes, Route, Navigate }        from 'react-router-dom'
import { Toaster }                                        from 'react-hot-toast'
import { useAuthStore }                                   from './store/authStore'
import Landing                                            from './pages/Landing'
import Login                                              from './pages/Login'
import Dashboard                                          from './pages/Dashboard'
import ClaimInitiation                                    from './pages/ClaimInitiation'
import PreValidation                                      from './pages/PreValidation'
import ResolutionCentre                                   from './pages/ResolutionCentre'
import ClaimSubmission                                    from './pages/ClaimSubmission'
import HelpPage                                           from './pages/HelpPage'

/** Route guard — waits until the session check completes to avoid a flash-to-login */
function ProtectedRoute({ children }) {
  const { isAuthenticated, sessionChecked } = useAuthStore()

  // While the /api/auth/me call is in-flight, render nothing (avoids redirect flicker)
  if (!sessionChecked) return null

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const checkSession = useAuthStore(s => s.checkSession)

  // Rehydrate auth state once on mount — reads the HttpOnly session cookie
  useEffect(() => { checkSession() }, [checkSession])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-ink)',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
            maxWidth: '380px',
          },
          success: { iconTheme: { primary: 'var(--color-pass)', secondary: '#fff' } },
          error:   { iconTheme: { primary: 'var(--color-fail)', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/claim"      element={<ProtectedRoute><ClaimInitiation /></ProtectedRoute>} />
        <Route path="/validate"   element={<ProtectedRoute><PreValidation /></ProtectedRoute>} />
        <Route path="/resolution" element={<ProtectedRoute><ResolutionCentre /></ProtectedRoute>} />
        <Route path="/submit"     element={<ProtectedRoute><ClaimSubmission /></ProtectedRoute>} />
        <Route path="/help"       element={<HelpPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
