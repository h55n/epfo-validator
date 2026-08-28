import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'

export default function ValidationSummary({ overall, onRerun }) {
  const navigate = useNavigate()

  const config = {
    PASS: {
      bg: 'var(--pass-bg)', border: 'var(--pass-border)',
      icon: CheckCircle, iconColor: 'var(--pass)',
      title: 'All checks passed',
      titleHi: 'सभी जांच पास हो गई',
      sub: 'Your claim is ready to submit. No issues found.',
      cta: 'Proceed to Submit Claim',
      ctaAction: () => navigate('/submit'),
    },
    FAIL: {
      bg: 'var(--fail-bg)', border: 'var(--fail-border)',
      icon: XCircle, iconColor: 'var(--fail)',
      title: 'Issues found — claim will be rejected',
      titleHi: 'समस्याएं मिलीं — दावा अस्वीकार होगा',
      sub: 'We\'ve generated the documents you need to fix each issue before resubmitting.',
      cta: 'See how to fix this',
      ctaAction: () => navigate('/resolution'),
    },
    ADVISORY: {
      bg: 'var(--warn-bg)', border: 'var(--warn-border)',
      icon: AlertTriangle, iconColor: 'var(--warn)',
      title: 'Advisory notice — review before submitting',
      titleHi: 'सलाह — जमा करने से पहले जांचें',
      sub: 'No critical blocks found, but there is a notice you should review.',
      cta: 'See recommendations',
      ctaAction: () => navigate('/resolution'),
    },
  }

  const c = config[overall]
  if (!c) return null
  const Icon = c.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      data-status="COMPLETE"
      className="validation-summary"
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 'var(--r-lg)',
        padding: '22px 24px',
      }}
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <Icon size={24} color={c.iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink-900)' }}>{c.title}</div>
          <div className="lang-hi" style={{ marginTop: '2px' }}>{c.titleHi}</div>
          <div style={{ fontSize: '13px', color: 'var(--ink-700)', marginTop: '6px', lineHeight: 1.6 }}>{c.sub}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
        <button onClick={c.ctaAction} className="btn-primary" style={{ flex: '1 1 auto', minWidth: '180px', fontSize: '14px' }}>
          {c.cta} <ArrowRight size={15} />
        </button>
        <button onClick={onRerun} className="btn-ghost" style={{ gap: '6px', fontSize: '13px', padding: '10px 16px', minHeight: 44 }}>
          <RefreshCw size={13} /> Re-run
        </button>
      </div>
    </motion.div>
  )
}
