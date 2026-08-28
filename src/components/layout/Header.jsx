import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useValidationStore } from '../../store/validationStore'
import { getProviderInfo } from '../../lib/aiAdapter'

const FLOW_STEPS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/claim',     label: 'Claim Type' },
  { path: '/validate',  label: 'Validate' },
  { path: '/resolution',label: 'Resolve' },
  { path: '/submit',    label: 'Submit' },
]

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuthStore()
  const { showHindi, toggleHindi } = useValidationStore()
  const provider = getProviderInfo()

  const handleLogout = () => { logout(); navigate('/') }

  const currentIdx = FLOW_STEPS.findIndex(s => location.pathname.startsWith(s.path))

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--ink-100)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
          <ShieldCheck size={20} color="var(--brand)" strokeWidth={2.5} />
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>EPFO Validator</span>
        </button>

        {/* Flow breadcrumb — hidden on mobile */}
        {currentIdx >= 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', overflow: 'hidden' }} className="flow-steps">
            {FLOW_STEPS.map((step, i) => {
              const done = i < currentIdx
              const active = i === currentIdx
              return (
                <div key={step.path} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {i > 0 && (
                    <div style={{ width: '20px', height: '1px', background: done || active ? 'var(--brand)' : 'var(--ink-100)', flexShrink: 0 }} />
                  )}
                  <button
                    onClick={() => done && navigate(step.path)}
                    style={{
                      background: 'none', border: 'none', cursor: done ? 'pointer' : 'default', padding: '3px 7px', borderRadius: 'var(--r-sm)',
                      fontSize: '12px', fontWeight: active ? 700 : done ? 600 : 500,
                      color: active ? 'var(--brand)' : done ? 'var(--ink-700)' : 'var(--ink-300)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* AI indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: 'var(--r-full)',
            background: 'var(--canvas)', border: '1px solid var(--ink-100)',
            fontSize: '11.5px', fontWeight: 500, color: 'var(--ink-500)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: provider.ready ? 'var(--pass)' : 'var(--ink-300)',
              display: 'inline-block', flexShrink: 0,
            }} />
            {provider.label}
          </div>

          {/* Hindi toggle */}
          <button
            onClick={toggleHindi}
            style={{
              padding: '5px 10px', borderRadius: 'var(--r-full)',
              background: showHindi ? 'var(--brand-light)' : 'transparent',
              color: showHindi ? 'var(--brand)' : 'var(--ink-500)',
              border: `1px solid ${showHindi ? 'var(--brand)' : 'var(--ink-100)'}`,
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            title="Toggle Hindi labels"
          >
            हिंदी
          </button>

          {/* User + logout */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1 }}>
                  {currentUser.memberName.split(' ')[0]}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--ink-500)', lineHeight: 1, marginTop: '2px' }}>
                  ···{currentUser.uan.slice(-4)}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: '1px solid var(--ink-100)', borderRadius: 'var(--r-sm)', padding: '6px', cursor: 'pointer', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' }}
                title="Log out"
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--fail-bg)'; e.currentTarget.style.color = 'var(--fail)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ink-500)'; }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .flow-steps { display: none !important; } }
      `}</style>
    </header>
  )
}
