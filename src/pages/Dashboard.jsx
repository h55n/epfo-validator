import { useNavigate } from 'react-router-dom'
import { ArrowRight, RefreshCw, Clock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useValidationStore } from '../store/validationStore'
import PrototypeBanner from '../components/layout/PrototypeBanner'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import MemberCard from '../components/dashboard/MemberCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { reset, showHindi } = useValidationStore()

  if (!currentUser) { navigate('/'); return null }

  const handleStartClaim = () => { reset(); navigate('/claim') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <PrototypeBanner />
      <Header />
      <PageWrapper>

        {/* Page title */}
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--ink-100)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Member Dashboard
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', margin: 0 }}>
            Welcome back, {currentUser.memberName.split(' ')[0]}
          </h1>
          {showHindi && <div className="lang-hi" style={{ marginTop: '4px' }}>राहत: आपका खाता सक्रिय है</div>}
          <div style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '6px' }}>
            {currentUser.epfoRegionalOffice}
          </div>
        </div>

        <MemberCard user={currentUser} />

        {/* Claim history */}
        <div className="card" style={{ padding: '18px 20px', marginTop: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink-900)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Clock size={14} color="var(--ink-300)" />
            Claim History
            {showHindi && <span className="lang-hi">/ दावा इतिहास</span>}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink-300)', padding: '10px 0', textAlign: 'center' }}>
            No previous claims on record.
            {showHindi && <div className="lang-hi" style={{ marginTop: '3px' }}>कोई पिछला दावा रिकॉर्ड में नहीं है।</div>}
          </div>
        </div>

        {/* Apply CTA */}
        <div style={{
          marginTop: '20px',
          background: 'var(--brand)',
          borderRadius: 'var(--r-lg)',
          padding: '28px 24px',
        }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
            Ready to apply for PF?
            {showHindi && <span className="lang-hi" style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400, display: 'inline', marginLeft: '8px' }}>/ PF के लिए आवेदन करें</span>}
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            We'll run 4 automatic checks before submission to catch any issues that would cause rejection.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleStartClaim}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'white', color: 'var(--brand)',
                padding: '12px 22px', borderRadius: 'var(--r-md)',
                fontWeight: 700, fontSize: '14px', border: 'none',
                cursor: 'pointer', minHeight: 48, flex: '1 1 auto',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Apply for PF Claim <ArrowRight size={15} />
            </button>
            <button
              onClick={() => { reset(); navigate('/validate') }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                padding: '12px 18px', borderRadius: 'var(--r-md)',
                fontWeight: 600, fontSize: '14px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', minHeight: 48,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <RefreshCw size={13} /> Quick Validate
            </button>
          </div>
        </div>

      </PageWrapper>
    </div>
  )
}
