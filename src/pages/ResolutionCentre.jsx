import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useValidationStore } from '../store/validationStore'
import ResolutionCard from '../components/resolution/ResolutionCard'
import PrototypeBanner from '../components/layout/PrototypeBanner'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

export default function ResolutionCentre() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { checks, showHindi } = useValidationStore()

  if (!currentUser) { navigate('/'); return null }

  const failed = Object.entries(checks).filter(([, v]) => v.status === 'FAIL' && v.resolution)
  const advisory = Object.entries(checks).filter(([, v]) => v.status === 'ADVISORY' && v.resolution)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <PrototypeBanner />
      <Header />
      <PageWrapper>
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--ink-500)', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: 'var(--brand-text)', fontWeight: 500 }} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={{ color: 'var(--ink-300)' }}>›</span>
          <span style={{ cursor: 'pointer', color: 'var(--brand-text)', fontWeight: 500 }} onClick={() => navigate('/validate')}>Validation</span>
          <span style={{ color: 'var(--ink-300)' }}>›</span>
          <span>Resolution</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Step 4 of 5</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink-900)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Resolution Centre</h1>
          {showHindi && <div className="lang-hi">समस्या का समाधान</div>}
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', margin: '8px 0 0' }}>
            {failed.length} critical issue{failed.length !== 1 ? 's' : ''}{advisory.length > 0 ? ` · ${advisory.length} advisory` : ''} — address these before resubmitting.
          </p>
        </motion.div>

        {/* Critical issues */}
        {failed.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--fail-border)' }} />
              <span className="badge badge-fail">CRITICAL ({failed.length})</span>
              <div style={{ height: '1px', flex: 1, background: 'var(--fail-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {failed.map(([key, data], i) => (
                <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <ResolutionCard checkKey={key} checkData={data} severity="CRITICAL" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Advisory */}
        {advisory.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--warn-border)' }} />
              <span className="badge badge-advisory">ADVISORY ({advisory.length})</span>
              <div style={{ height: '1px', flex: 1, background: 'var(--warn-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {advisory.map(([key, data], i) => (
                <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (failed.length + i) * 0.1 }}>
                  <ResolutionCard checkKey={key} checkData={data} severity="ADVISORY" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Passed items — compact */}
        {(() => {
          const passed = Object.entries(checks).filter(([, v]) => v.status === 'PASS')
          if (!passed.length) return null
          return (
            <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--pass)', marginBottom: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <CheckCircle size={15} /> Checks that passed
              </div>
              {passed.map(([key, data]) => (
                <div key={key} style={{ fontSize: '13px', color: 'var(--ink-700)', padding: '5px 0', borderBottom: '1px solid var(--ink-100)' }}>
                  ✓ {data.explanation}
                </div>
              ))}
            </div>
          )
        })()}

        {/* Bottom CTAs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button onClick={() => navigate('/validate')} className="btn-secondary" style={{ gap: '8px', flex: '1 1 auto' }}>
            <RefreshCw size={15} /> Re-run Validation
            {showHindi && <span style={{ fontSize: '13px' }}>/ पुनः सत्यापन</span>}
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ gap: '6px' }}>
            <ArrowLeft size={14} /> Dashboard
          </button>
        </div>

        {/* Advisory note */}
        <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'var(--ink-500)', lineHeight: 1.6 }}>
          Once you've addressed each issue above, re-run the validation. Your claim can only be submitted after all critical issues are resolved.
        </div>
      </PageWrapper>
    </div>
  )
}
