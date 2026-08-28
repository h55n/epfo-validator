import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useValidationStore } from '../store/validationStore'
import { runValidation } from '../lib/validationEngine'
import ValidationCard from '../components/validation/ValidationCard'
import ValidationSummary from '../components/validation/ValidationSummary'
import PrototypeBanner from '../components/layout/PrototypeBanner'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'

const CHECK_KEYS = ['nameMatch', 'dobMatch', 'employerExit', 'bankKyc']

export default function PreValidation() {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { validationStatus, setValidationStatus, updateCheck, reset, getOverallResult, showHindi, selectedClaimType } = useValidationStore()
  const [done, setDone] = useState(false)

  // All hooks must be called before any conditional return
  useEffect(() => {
    if (!currentUser) {
      navigate('/', { replace: true })
      return
    }
    if (validationStatus === 'IDLE') {
      startValidation()
    } else if (validationStatus === 'COMPLETE') {
      setDone(true)
    }
  // startValidation is defined below — safe to omit from deps for this pattern
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const startValidation = async () => {
    setValidationStatus('RUNNING')
    setDone(false)
    await runValidation(currentUser, selectedClaimType || 'FINAL_SETTLEMENT', (checkName, data) => {
      updateCheck(checkName, data)
    })
    setValidationStatus('COMPLETE')
    setDone(true)
  }

  const handleRerun = () => {
    reset()
    setTimeout(() => startValidation(), 100)
  }

  const overall = done ? getOverallResult() : null

  if (!currentUser) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <PrototypeBanner />
      <Header />
      <PageWrapper>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Step 3 of 5
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink-900)', margin: 0, letterSpacing: '-0.02em' }}>
              Pre-Validation
            </h1>
            <ShieldCheck size={22} color="var(--brand)" style={{ flexShrink: 0 }} />
          </div>
          {showHindi && <div className="lang-hi">दस्तावेज़ सत्यापन</div>}
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', margin: '8px 0 0' }}>
            {done
              ? 'Validation complete. Review results below.'
              : 'Running 4 checks to prevent rejection. Takes about 10 seconds.'}
          </p>

          {/* Overall progress when running */}
          {!done && (
            <div style={{ marginTop: '14px' }}>
              <div className="progress-indeterminate" />
            </div>
          )}
        </motion.div>

        {/* Validation cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {CHECK_KEYS.map((key, i) => (
            <ValidationCard key={key} checkKey={key} index={i} />
          ))}
        </div>

        {/* Summary */}
        {done && overall && (
          <ValidationSummary overall={overall} onRerun={handleRerun} />
        )}

        {/* Back */}
        <div style={{ marginTop: '16px' }}>
          <button onClick={() => navigate('/claim')} className="btn-ghost" style={{ gap: '6px', fontSize: '13px', minHeight: 40 }}>
            <ArrowLeft size={13} /> Back to Claim Type
          </button>
        </div>
      </PageWrapper>
    </div>
  )
}
