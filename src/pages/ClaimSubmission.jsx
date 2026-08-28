import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Send, Loader2, Copy, ExternalLink, ShieldX, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useValidationStore } from '../store/validationStore'
import { formatIndianCurrency } from '../lib/utils'
import StatusTimeline from '../components/dashboard/StatusTimeline'
import PrototypeBanner from '../components/layout/PrototypeBanner'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { CLAIM_TYPES } from '../constants/claimTypes'
import toast from 'react-hot-toast'

function generateRef() {
  return `EPFO-2026-PF-${Math.floor(100000 + Math.random() * 900000)}`
}

/** Safe clipboard with execCommand fallback */
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => copyViaExecCommand(text))
  }
  return Promise.resolve(copyViaExecCommand(text))
}

function copyViaExecCommand(text) {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export default function ClaimSubmission() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { checks, validationStatus, getOverallResult, selectedClaimType, showHindi } = useValidationStore()
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ref] = useState(generateRef)

  // Declarative guard — no render-time navigate
  useEffect(() => {
    if (!currentUser) navigate('/', { replace: true })
  }, [currentUser, navigate])

  if (!currentUser) return null

  const claimType = CLAIM_TYPES.find(c => c.id === selectedClaimType) || CLAIM_TYPES[0]

  // ── Validation guard ──────────────────────────────────────────────────────
  // Prevent submitting if validation hasn't run or didn't fully pass
  const validationComplete = validationStatus === 'COMPLETE'
  const overallResult = validationComplete ? getOverallResult() : null
  const canSubmit = overallResult === 'PASS' && Boolean(selectedClaimType)

  // Derive what passed/failed from actual check results
  const checkItems = [
    { label: 'Name Match',         key: 'nameMatch' },
    { label: 'Date of Birth',      key: 'dobMatch' },
    { label: 'Employer Exit Date', key: 'employerExit' },
    { label: 'Bank KYC',           key: 'bankKyc' },
  ].map(item => ({ ...item, status: checks[item.key]?.status || 'PENDING' }))

  const handleSubmit = async () => {
    if (!agreed || !canSubmit) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1800))
    setSubmitting(false)
    setSubmitted(true)
    toast.success('Claim submitted successfully!', { icon: '✅', duration: 4000 })
  }

  const handleCopyRef = async () => {
    try {
      const copied = await copyToClipboard(ref)
      if (!copied) throw new Error('Clipboard unavailable')
      toast.success('Reference number copied!', { icon: '📋' })
    } catch {
      toast.error('Could not copy. Please select and copy manually.')
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
        <PrototypeBanner />
        <Header />
        <PageWrapper>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}>

            {/* Success hero */}
            <div style={{ textAlign: 'center', padding: '40px 20px 28px' }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 320 }}
                style={{ width: 68, height: 68, background: 'var(--pass-bg)', border: '2px solid var(--pass-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
              >
                <CheckCircle size={32} color="var(--pass)" />
              </motion.div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-900)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Claim Submitted
              </h1>
              {showHindi && <div className="lang-hi">दावा सफलतापूर्वक जमा किया गया</div>}
              <p style={{ fontSize: '14px', color: 'var(--ink-500)', margin: '8px 0 0' }}>
                Your PF claim has been received and is being processed.
              </p>
            </div>

            {/* Reference number */}
            <div style={{ background: 'var(--pass-bg)', border: '1.5px solid var(--pass-border)', borderRadius: 'var(--r-lg)', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Reference Number
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '0.06em', marginBottom: '12px', fontFamily: 'monospace' }}>
                {ref}
              </div>
              <button onClick={handleCopyRef} className="btn-ghost" style={{ gap: '6px', fontSize: '13px', padding: '8px 16px', minHeight: '36px' }}>
                <Copy size={13} /> Copy Reference
              </button>
            </div>

            {/* Processing timeline */}
            <div className="card" style={{ padding: '22px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink-900)', marginBottom: '20px' }}>
                Processing Timeline
              </div>
              <StatusTimeline reference={ref} />
              <div style={{ marginTop: '18px', padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'var(--ink-500)' }}>
                📱 You will receive SMS updates on your registered mobile number. Track on EPFiGMS portal.
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <a href="https://epfigms.gov.in" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ gap: '7px', flex: '1 1 auto', textDecoration: 'none', justifyContent: 'center', fontSize: '13px', minHeight: 44 }}>
                <ExternalLink size={14} /> Track on EPFiGMS
              </a>
              <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ flex: '1 1 auto', gap: '6px', fontSize: '14px' }}>
                Back to Dashboard
              </button>
            </div>

            {/* Prototype disclaimer */}
            <div style={{ padding: '12px 16px', background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 'var(--r-md)', fontSize: '12px', color: 'var(--warn-text)', lineHeight: 1.5 }}>
              ⚠ Hackathon prototype. No actual PF withdrawal has been initiated. Reference number and timeline are for demonstration only.
            </div>
          </motion.div>
        </PageWrapper>
      </div>
    )
  }

  // ── Validation required block ──────────────────────────────────────────────
  if (!canSubmit) {
    const reason = !validationComplete
      ? { icon: ShieldX, title: 'Validation not complete', body: 'You must complete the pre-validation check before submitting a claim.', cta: 'Run Validation', path: '/validate' }
      : !selectedClaimType
        ? { icon: AlertTriangle, title: 'Select a claim type first', body: 'Choose the type of PF claim you want to make before reviewing or submitting it.', cta: 'Select Claim Type', path: '/claim' }
        : { icon: AlertTriangle, title: 'Claim cannot be submitted', body: 'Your pre-validation found critical issues. Download the fix documents and resolve each issue before resubmitting.', cta: 'View Resolution Steps', path: '/resolution' }

    const BlockIcon = reason.icon
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
        <PrototypeBanner />
        <Header />
        <PageWrapper>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: 'var(--fail-bg)', border: '1.5px solid var(--fail-border)', borderRadius: 'var(--r-lg)', padding: '32px 28px', textAlign: 'center' }}>
              <BlockIcon size={40} color="var(--fail)" style={{ margin: '0 auto 16px' }} />
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-900)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                {reason.title}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--ink-700)', margin: '0 0 24px', lineHeight: 1.65 }}>
                {reason.body}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate(reason.path)} className="btn-primary" style={{ gap: '7px', fontSize: '14px' }}>
                  {reason.cta}
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ fontSize: '14px', gap: '6px' }}>
                  <ArrowLeft size={13} /> Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        </PageWrapper>
      </div>
    )
  }

  // ── Main submission form ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <PrototypeBanner />
      <Header />
      <PageWrapper>

        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--ink-500)', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', color: 'var(--brand-text)', fontWeight: 500 }} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={{ color: 'var(--ink-300)' }}>›</span>
          <span style={{ cursor: 'pointer', color: 'var(--brand-text)', fontWeight: 500 }} onClick={() => navigate('/validate')}>Validation</span>
          <span style={{ color: 'var(--ink-300)' }}>›</span>
          <span>Submit Claim</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Step 5 of 5</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink-900)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Submit Your Claim</h1>
          {showHindi && <div className="lang-hi">दावा जमा करें</div>}
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', margin: '8px 0 24px' }}>All 4 checks passed. Review your details and confirm to submit.</p>
        </motion.div>

        {/* Actual check results — not hardcoded */}
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {checkItems.map(item => (
            <span
              key={item.key}
              className={`badge ${item.status === 'PASS' ? 'badge-pass' : item.status === 'ADVISORY' ? 'badge-advisory' : 'badge-fail'}`}
              style={{ fontSize: '12px' }}
            >
              {item.status === 'PASS' ? '✓' : '⚠'} {item.label}
            </span>
          ))}
        </div>

        {/* Claim summary */}
        <div className="card" style={{ padding: '20px', marginBottom: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink-900)', marginBottom: '14px' }}>Claim Summary</div>
          {[
            { label: 'Claim Type',       value: `${claimType.title} (${claimType.form})` },
            { label: 'Member Name',      value: currentUser.memberName },
            { label: 'UAN',              value: currentUser.uan },
            { label: 'Establishment',    value: currentUser.establishmentName },
            { label: 'PF Balance',       value: formatIndianCurrency(currentUser.pfBalance) },
            { label: 'Destination Bank', value: `${currentUser.bankAccount.maskedNumber} (${currentUser.bankAccount.bankName})` },
            { label: 'Claim Date',       value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--ink-100)' : 'none', fontSize: '13px', gap: '12px' }}>
              <span style={{ color: 'var(--ink-500)', flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: 'var(--ink-900)', textAlign: 'right' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Declaration checkbox */}
        <div className="card" style={{ padding: '18px 20px', marginBottom: '18px' }}>
          <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              id="declaration-checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0, accentColor: 'var(--brand)' }}
            />
            <span style={{ fontSize: '13.5px', color: 'var(--ink-700)', lineHeight: 1.65 }}>
              I declare that the information above is correct to the best of my knowledge. I understand this is a prototype demonstration and no actual PF withdrawal is being initiated.
              {showHindi && <span className="lang-hi" style={{ display: 'block', marginTop: '4px' }}>मैं घोषणा करता/करती हूं कि उपरोक्त जानकारी सही है।</span>}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/validate')} className="btn-ghost" style={{ gap: '6px', fontSize: '13px', minHeight: 44 }}>
            <ArrowLeft size={13} /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!agreed || submitting}
            className="btn-primary"
            style={{ flex: 1, gap: '7px', minWidth: '180px', fontSize: '14px' }}
          >
            {submitting
              ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              : <><Send size={15} /> Submit Claim {showHindi && '/ दावा जमा करें'}</>
            }
          </button>
        </div>
      </PageWrapper>
    </div>
  )
}
