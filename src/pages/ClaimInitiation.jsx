import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useValidationStore } from '../store/validationStore'
import { CLAIM_TYPES } from '../constants/claimTypes'
import PrototypeBanner from '../components/layout/PrototypeBanner'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

export default function ClaimInitiation() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { setClaimType, selectedClaimType, showHindi } = useValidationStore()
  const [selected, setSelected] = useState(selectedClaimType || null)

  if (!currentUser) { navigate('/'); return null }

  const handleSelect = (id) => { setSelected(id); setClaimType(id) }
  const handleContinue = () => { if (selected) navigate('/validate') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <PrototypeBanner />
      <Header />
      <PageWrapper>
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--ink-500)', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: 'var(--brand-text)', fontWeight: 500 }} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={{ color: 'var(--ink-300)' }}>›</span> <span>Select Claim Type</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Claim Type</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px', color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
            Select Claim Type
          </h1>
          {showHindi && <div className="lang-hi">दावे का प्रकार चुनें</div>}
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', margin: '8px 0 24px' }}>
            Choose the type of PF withdrawal you want to apply for.
          </p>
        </motion.div>

        {/* Claim type cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CLAIM_TYPES.map((claim, i) => (
            <motion.button
              key={claim.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(claim.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '20px', cursor: 'pointer',
                border: `1.5px solid ${selected === claim.id ? 'var(--brand)' : 'var(--ink-100)'}`,
                borderRadius: 'var(--r-lg)', background: selected === claim.id ? 'var(--brand-light)' : 'var(--surface)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{claim.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink-900)' }}>{claim.title}</div>
                    {claim.badge && <span className="badge badge-primary" style={{ fontSize: '11px' }}>{claim.badge}</span>}
                  </div>
                  {showHindi && <div className="lang-hi">{claim.titleHi}</div>}
                  <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--ink-300)', marginTop: '4px', fontFamily: 'monospace', letterSpacing: '0.03em' }}>{claim.form}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-700)', marginTop: '6px', lineHeight: 1.5 }}>{claim.description}</div>
                </div>
                {selected === claim.id && <CheckCircle size={22} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Eligibility + CTA */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ marginTop: '20px' }}>
              {/* Eligibility summary */}
              <div style={{ background: 'var(--pass-bg)', border: '1px solid var(--pass-border)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--pass)', marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShieldCheck size={15} color="var(--pass)" /> Eligibility Summary
                </div>
                {[
                  { label: 'Service duration', value: 'Qualifies', pass: true },
                  { label: 'Employer status', value: currentUser.exitUpdated ? 'Exit updated' : 'Exit not updated', pass: currentUser.exitUpdated },
                  { label: 'Bank KYC', value: currentUser.bankAccount.kycVerified ? 'Verified' : 'Pending', pass: currentUser.bankAccount.kycVerified },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid rgba(26,122,74,0.1)', color: 'var(--ink-700)' }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.pass ? 'var(--pass)' : 'var(--fail)', fontWeight: 700 }}>{item.pass ? '✓' : '⚠'} {item.value}</span>
                  </div>
                ))}
              </div>

              {/* Pre-validation info */}
              <div style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--r-md)', padding: '13px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--ink-700)' }}>
                <strong style={{ color: 'var(--info)' }}>Before submitting,</strong> we'll run 4 automatic checks on your records to catch any issues that would cause rejection. This takes about 10 seconds.
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ gap: '6px', fontSize: '14px' }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={handleContinue} className="btn-primary" style={{ flex: 1, gap: '7px', fontSize: '14px' }}>
                  Run Pre-Validation <ArrowRight size={15} />
                  {showHindi && <span style={{ fontSize: '12px', opacity: 0.8 }}>/ पात्रता जांचें</span>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageWrapper>
    </div>
  )
}
