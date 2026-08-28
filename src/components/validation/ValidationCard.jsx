import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Loader2, Clock, ExternalLink } from 'lucide-react'
import { useValidationStore } from '../../store/validationStore'

const STATUS_CONFIG = {
  PENDING:  { icon: Clock,          color: 'var(--ink-300)',   bg: 'var(--surface)',   border: 'var(--ink-100)',    label: 'Waiting',        cls: '' },
  RUNNING:  { icon: Loader2,        color: 'var(--info)',      bg: 'var(--info-bg)',   border: 'var(--info-border)',label: 'Checking…',      cls: 'running' },
  PASS:     { icon: CheckCircle,    color: 'var(--pass)',      bg: 'var(--pass-bg)',   border: 'var(--pass-border)',label: 'Passed',         cls: 'pass' },
  FAIL:     { icon: XCircle,        color: 'var(--fail)',      bg: 'var(--fail-bg)',   border: 'var(--fail-border)',label: 'Action Needed',  cls: 'fail' },
  ADVISORY: { icon: AlertTriangle,  color: 'var(--warn)',      bg: 'var(--warn-bg)',   border: 'var(--warn-border)',label: 'Advisory',       cls: 'advisory' },
}

const CHECK_META = {
  nameMatch:    { title: 'Name Match',          titleHi: 'नाम मिलान',             sub: 'EPF Records vs. Aadhaar',           subHi: 'EPF रिकॉर्ड बनाम Aadhaar' },
  dobMatch:     { title: 'Date of Birth',       titleHi: 'जन्म तिथि',             sub: 'EPF Records vs. Aadhaar',           subHi: 'EPF रिकॉर्ड बनाम Aadhaar' },
  employerExit: { title: 'Employer Exit Date',  titleHi: 'नियोक्ता निकास तिथि',  sub: 'Previous employer must update UAN', subHi: 'पिछले नियोक्ता को UAN अपडेट करना होगा' },
  bankKyc:      { title: 'Bank KYC',            titleHi: 'बैंक KYC',              sub: 'Account linked & employer-approved',subHi: 'खाता जुड़ा और नियोक्ता-स्वीकृत' },
}

const CHECK_NUM = { nameMatch: '01', dobMatch: '02', employerExit: '03', bankKyc: '04' }

// Official EPFO source links for each rule — shown as a footnote once the check settles.
// URLs point to public EPFO / Ministry pages; no login required.
const POLICY_URLS = {
  nameMatch:    { label: 'EPFO Circular WSU/15(1)2019 — Name Correction SOP', url: 'https://www.epfindia.gov.in/site_en/UAN.php' },
  dobMatch:     { label: 'EPF Scheme 1952, Para 36A — Aadhaar KYC seeding', url: 'https://epfindia.gov.in/site_en/KYC.php' },
  employerExit: { label: 'EPF Scheme 1952, Para 72(5) — Employer exit update', url: 'https://www.epfindia.gov.in/site_en/For_Employers.php' },
  bankKyc:      { label: 'EPFO Circular WSU/1(1)/2017/KYC — Bank KYC approval', url: 'https://www.epfindia.gov.in/site_en/KYC.php' },
}

export default function ValidationCard({ checkKey, index }) {
  const { checks, showHindi } = useValidationStore()
  const check = checks[checkKey]
  const meta = CHECK_META[checkKey]
  const cfg = STATUS_CONFIG[check.status] || STATUS_CONFIG.PENDING
  const Icon = cfg.icon
  const settled = check.status === 'PASS' || check.status === 'FAIL' || check.status === 'ADVISORY'
  const policy = POLICY_URLS[checkKey]

  const badgeClass = cfg.cls === 'pass' ? 'badge-pass' : cfg.cls === 'fail' ? 'badge-fail' : cfg.cls === 'advisory' ? 'badge-advisory' : 'badge-info'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className={`validation-card ${cfg.cls}`}
      role="status"
      aria-live="polite"
      data-check-key={checkKey}
      data-check-status={check.status}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Check number + icon */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-300)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {CHECK_NUM[checkKey]}
          </div>
          <motion.div
            key={check.status}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <Icon
              size={22}
              color={cfg.color}
              className={check.status === 'RUNNING' ? 'animate-spin' : ''}
              aria-label={cfg.label}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink-900)' }}>{meta.title}</div>
              {showHindi && <div className="lang-hi">{meta.titleHi}</div>}
              <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '2px' }}>{showHindi ? meta.subHi : meta.sub}</div>
            </div>
            {check.status !== 'PENDING' && (
              <span className={`badge ${badgeClass}`}>{cfg.label}</span>
            )}
          </div>

          {/* Progress bar while running */}
          {check.status === 'RUNNING' && (
            <div style={{ marginTop: '12px' }}>
              <div className="progress-indeterminate" />
              <div style={{ fontSize: '11px', color: 'var(--info)', marginTop: '5px', fontWeight: 500 }}>
                Verifying with EPFO records…
              </div>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {settled && check.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ marginTop: '10px', overflow: 'hidden' }}
              >
                <p style={{ fontSize: '13.5px', color: 'var(--ink-700)', margin: 0, lineHeight: 1.6 }}>{check.explanation}</p>
                {showHindi && check.hindiExplanation && (
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-500)', marginTop: '4px', marginBottom: 0 }}>{check.hindiExplanation}</p>
                )}

                {/* Policy source link — official EPFO reference for this rule */}
                {policy && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--ink-100)' }}>
                    <a
                      href={policy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        color: 'var(--ink-500)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                      aria-label={`Official source: ${policy.label} (opens in new tab)`}
                    >
                      <ExternalLink size={11} aria-hidden="true" />
                      {policy.label}
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
