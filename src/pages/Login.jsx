import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Loader2, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  {
    name: 'Ramesh Kumar Sharma',
    uan: '100673291847',
    label: 'Name Mismatch',
    tag: 'Check 1 fails',
    tagColor: 'var(--fail)',
    tagBg: 'var(--fail-bg)',
    dot: 'var(--fail)',
  },
  {
    name: 'Fatima Begum Shaikh',
    uan: '100891234567',
    label: 'Multiple Issues',
    tag: 'Checks 3 + 4 fail',
    tagColor: 'var(--warn)',
    tagBg: 'var(--warn-bg)',
    dot: 'var(--warn)',
  },
  {
    name: 'Vijay Ramrao Patil',
    uan: '100334455678',
    label: 'All Clear',
    tag: 'All 4 pass',
    tagColor: 'var(--pass)',
    tagBg: 'var(--pass-bg)',
    dot: 'var(--pass)',
  },
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [uan, setUan] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!uan.trim()) { setError('Enter your 12-digit UAN number.'); return }
    if (!password)    { setError('Enter your password.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const result = await login(uan, password)
    setLoading(false)
    if (result.success) {
      toast.success('Logged in successfully')
      navigate('/dashboard')
    } else {
      setError(result.error || 'Invalid UAN or password. Use a demo account below.')
    }
  }

  const fillDemo = (acc) => {
    setUan(acc.uan)
    setPassword('Demo@1234')
    setError('')
    toast(`Filled: ${acc.name.split(' ')[0]}`, { duration: 1200 })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', display: 'flex', flexDirection: 'column' }}>
      <div className="prototype-banner">
        ⚠ <strong>HACKATHON PROTOTYPE</strong> — Not an official EPFO product. No actual PF data is used.
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Brand mark */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
              <ShieldCheck size={28} color="var(--brand)" strokeWidth={2} />
              <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>EPFO Validator</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--ink-500)' }}>
              Catch rejection reasons before you submit
            </div>
            <div className="lang-hi" style={{ marginTop: '4px', textAlign: 'center' }}>जमा करने से पहले अस्वीकृति कारण पकड़ें</div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            background: 'var(--surface)', border: '1px solid var(--ink-100)',
            borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: '28px',
          }}>
            {[
              { n: '1 in 5', l: 'PF claims rejected' },
              { n: '174L',   l: 'Rejections 2024–25' },
              { n: '4',      l: 'Root causes caught' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 10px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--ink-100)' : 'none' }}>
                <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--brand)', letterSpacing: '-0.02em' }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: 'var(--ink-500)', marginTop: '3px', lineHeight: 1.3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Login card */}
          <div className="card-raised" style={{ padding: '28px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--ink-900)', marginBottom: '2px' }}>Member Login</div>
            <div className="lang-hi" style={{ marginBottom: '20px' }}>सदस्य लॉगिन</div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--fail-bg)', border: '1px solid var(--fail-border)',
                borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: '16px',
              }}>
                <AlertCircle size={15} color="var(--fail)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--fail)', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: 'var(--ink-700)', marginBottom: '6px', letterSpacing: '0.01em' }}>
                  UAN Number <span style={{ fontWeight: 400, color: 'var(--ink-300)' }}>/ UAN नंबर</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  className={`input-field${error ? ' error' : ''}`}
                  placeholder="Enter 12-digit UAN"
                  value={uan}
                  onChange={e => setUan(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  id="uan-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: 'var(--ink-700)', marginBottom: '6px', letterSpacing: '0.01em' }}>
                  Password <span style={{ fontWeight: 400, color: 'var(--ink-300)' }}>/ पासवर्ड</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`input-field${error ? ' error' : ''}`}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ paddingRight: '44px' }}
                    id="password-input"
                  />
                  <button
                    onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink-300)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button onClick={handleLogin} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '4px', fontSize: '15px' }}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                  : <>Login <ChevronRight size={16} /></>
                }
              </button>
            </div>

            {/* Demo accounts */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--ink-100)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', textAlign: 'center' }}>
                Demo accounts — click to fill
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.uan}
                    onClick={() => fillDemo(acc)}
                    id={`demo-${acc.uan}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 14px',
                      border: `1.5px solid ${uan === acc.uan ? 'var(--brand)' : 'var(--ink-100)'}`,
                      borderRadius: 'var(--r-md)',
                      background: uan === acc.uan ? 'var(--brand-light)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: acc.dot, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-900)' }}>{acc.name.split(' ').slice(0, 2).join(' ')}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-500)', marginTop: '1px' }}>{acc.label} · {acc.uan}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                      borderRadius: 'var(--r-full)',
                      background: acc.tagBg, color: acc.tagColor,
                      whiteSpace: 'nowrap', letterSpacing: '0.02em',
                    }}>
                      {acc.tag}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-300)', textAlign: 'center', marginTop: '10px' }}>
                Password for all accounts: <code style={{ fontFamily: 'monospace', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 3 }}>Demo@1234</code>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-300)', marginTop: '20px', lineHeight: 1.6 }}>
            Built for the <strong style={{ color: 'var(--ink-500)' }}>Build What Moves India</strong> hackathon (2026).
            Uses mock data only.
          </p>
        </div>
      </div>
    </div>
  )
}
