import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, AlertTriangle, ChevronDown, ChevronUp, CheckCheck, Loader2, FileText, Clipboard, ExternalLink } from 'lucide-react'
import { useValidationStore } from '../../store/validationStore'
import { generateJointDeclaration, generateEmployerLetter, generateEPFiGMSComplaint } from '../../lib/documentGenerator'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import DocumentModal from '../document/DocumentModal'

const RESOLUTION_CONFIG = {
  JOINT_DECLARATION: {
    title: 'Joint Declaration Required',
    titleHi: 'संयुक्त घोषणा आवश्यक',
    what: 'A form signed jointly by you and your employer, submitted to your EPFO regional office to correct the name discrepancy.',
    whatHi: 'आप और आपके नियोक्ता द्वारा संयुक्त रूप से हस्ताक्षरित एक फॉर्म।',
    steps: [
      'Download the pre-filled Joint Declaration form below',
      'Get it signed and stamped by your current/previous employer\'s HR department',
      'Submit at your EPFO regional office (in person or by registered post)',
      'Track correction status on the EPFiGMS portal',
    ],
    stepsHi: [
      'नीचे से पूर्व-भरा संयुक्त घोषणा फॉर्म डाउनलोड करें',
      'अपने नियोक्ता के HR विभाग से हस्ताक्षर और मुहर लगवाएं',
      'अपने EPFO क्षेत्रीय कार्यालय में जमा करें',
      'EPFiGMS पोर्टल पर सुधार की स्थिति ट्रैक करें',
    ],
    timeEstimate: '15–30 days (if employer cooperates)',
    docType: 'jointDeclaration',
    docLabel: 'Download Joint Declaration',
    showComplaint: true,
    complaintType: 'NAME',
  },
  EMPLOYER_ACTION: {
    title: 'Employer Must Update Your Exit Date',
    titleHi: 'नियोक्ता को निकास तिथि अपडेट करनी होगी',
    what: 'Your previous employer has not marked your last working day in the UAN system. Only they can fix this — you cannot do it yourself.',
    whatHi: 'आपके पिछले नियोक्ता ने UAN सिस्टम में आपकी अंतिम कार्य तिथि दर्ज नहीं की है।',
    steps: [
      'Contact your previous employer\'s HR department formally (keep a written record)',
      'Ask them to update your exit date in the UAN Employer Portal under your UAN',
      'If no response within 15 days, file a grievance on EPFiGMS under "Non-transfer/Exit not updated"',
      'Come back here to re-run validation after the update',
    ],
    stepsHi: [
      'अपने पिछले नियोक्ता के HR विभाग से लिखित में संपर्क करें',
      'उन्हें आपके UAN के तहत UAN नियोक्ता पोर्टल में निकास तिथि अपडेट करने के लिए कहें',
      '15 दिनों में कोई जवाब नहीं मिलने पर EPFiGMS पर शिकायत दर्ज करें',
      'अपडेट के बाद यहाँ वापस आकर पुन: सत्यापन करें',
    ],
    timeEstimate: '15–30 days (employer cooperates) or 30–90 days (EPFiGMS escalation)',
    docType: 'employerLetter',
    docLabel: 'Generate Employer Escalation Letter',
    showComplaint: true,
    complaintType: 'EMPLOYER_EXIT',
  },
  BANK_REVERIFICATION: {
    title: 'Bank Account Re-verification Needed',
    titleHi: 'बैंक खाते का पुनः सत्यापन आवश्यक',
    what: 'Your bank account has been added to the EPFO portal but your employer has not approved it yet. KYC approval is required before EPFO can transfer funds.',
    whatHi: 'आपका बैंक खाता EPFO पोर्टल में जोड़ा गया है लेकिन नियोक्ता ने अभी तक इसे मंजूरी नहीं दी है।',
    steps: [
      'Login to the UAN Member Portal (unifiedportal-mem.epfindia.gov.in)',
      'Go to KYC section and check your bank account status',
      'Contact your employer\'s HR to approve your bank KYC in the Employer Portal',
      'Alternatively, visit your nearest Common Service Centre (CSC) for in-person verification',
    ],
    stepsHi: [
      'UAN सदस्य पोर्टल पर लॉगिन करें',
      'KYC अनुभाग में जाएं और अपने बैंक खाते की स्थिति जांचें',
      'अपने नियोक्ता के HR से नियोक्ता पोर्टल में बैंक KYC अनुमोदित करने के लिए कहें',
      'वैकल्पिक रूप से, व्यक्तिगत सत्यापन के लिए अपने नजदीकी CSC केंद्र जाएं',
    ],
    timeEstimate: '3–10 days (employer approval) or 1–3 days (CSC visit)',
    docType: null,
    docLabel: null,
    showComplaint: true,
    complaintType: 'BANK_KYC',
  },
  DOB_CORRECTION: {
    title: 'Date of Birth Correction Required',
    titleHi: 'जन्म तिथि सुधार आवश्यक',
    what: 'There is a mismatch between your date of birth in EPF records and Aadhaar. You need to submit documentary proof to correct this.',
    whatHi: 'EPF रिकॉर्ड और Aadhaar में जन्म तिथि अलग है। सुधार के लिए दस्तावेज़ी प्रमाण जमा करना होगा।',
    steps: [
      'Gather documentary proof: birth certificate, school leaving certificate, or passport',
      'Submit a correction request at your EPFO regional office with the documents',
      'If your Aadhaar DOB is incorrect, first correct it at a UIDAI Aadhaar centre',
      'Track status on EPFiGMS after submission',
    ],
    stepsHi: [
      'दस्तावेज़ी प्रमाण इकट्ठा करें: जन्म प्रमाण पत्र, स्कूल छोड़ने का प्रमाण पत्र, या पासपोर्ट',
      'दस्तावेजों के साथ अपने EPFO क्षेत्रीय कार्यालय में सुधार अनुरोध जमा करें',
      'यदि Aadhaar जन्म तिथि गलत है, तो पहले UIDAI Aadhaar केंद्र में इसे सुधारें',
    ],
    timeEstimate: '30–60 days',
    docType: null,
    docLabel: null,
    showComplaint: false,
    complaintType: null,
  },
}

export default function ResolutionCard({ checkKey: _checkKey, checkData, severity = 'CRITICAL' }) {
  const { currentUser } = useAuthStore()
  const { generatedDocuments, setDocument, showHindi } = useValidationStore()
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [modalDoc, setModalDoc] = useState(null)
  const [complaintLoading, setComplaintLoading] = useState(false)

  const resolutionKey = checkData?.resolution
  const config = RESOLUTION_CONFIG[resolutionKey]
  if (!config) return null

  const isCritical = severity === 'CRITICAL' || checkData?.status === 'FAIL'

  const handleGenerate = async () => {
    if (!config.docType) return
    const existing = generatedDocuments[config.docType]
    if (existing) { setModalDoc({ content: existing, type: config.docType }); return }

    setLoading(true)
    try {
      let content = ''
      if (config.docType === 'jointDeclaration') content = await generateJointDeclaration(currentUser, checkData)
      else if (config.docType === 'employerLetter') content = await generateEmployerLetter(currentUser)
      setDocument(config.docType, content)
      setModalDoc({ content, type: config.docType })
    } finally { setLoading(false) }
  }

  const handleComplaint = async () => {
    const existing = generatedDocuments.epfigmsText
    if (existing) { copyToClipboard(existing); return }

    setComplaintLoading(true)
    try {
      const text = await generateEPFiGMSComplaint(config.complaintType, currentUser)
      setDocument('epfigmsText', text)
      copyToClipboard(text)
    } finally { setComplaintLoading(false) }
  }

  const copyToClipboard = (text) => {
    const doCopy = () => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
      }
      // execCommand fallback for non-secure contexts
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
        document.body.appendChild(ta)
        ta.focus(); ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        return Promise.resolve()
      } catch (e) {
        return Promise.reject(e)
      }
    }

    doCopy()
      .then(() => {
        setCopied(true)
        toast.success('EPFiGMS complaint text copied!', { icon: '📋' })
        setTimeout(() => setCopied(false), 3000)
      })
      .catch(() => toast.error('Copy failed. Please select and copy manually.'))
  }

  const borderColor = isCritical ? 'var(--fail-border)' : 'var(--warn-border)'
  const badgeClass = isCritical ? 'badge-fail' : 'badge-advisory'
  const badgeLabel = isCritical ? 'CRITICAL' : 'ADVISORY'
  const HeaderIcon = isCritical ? XCircle : AlertTriangle
  const iconColor = isCritical ? 'var(--fail)' : 'var(--warn)'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ border: `1.5px solid ${borderColor}`, borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface)' }}
      >
        {/* Header */}
        <button
          onClick={() => setIsOpen(o => !o)}
          aria-expanded={isOpen}
          style={{ width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <HeaderIcon size={22} color={iconColor} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink-900)' }}>{config.title}</div>
            {showHindi && <div className="lang-hi">{config.titleHi}</div>}
          </div>
          <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
          {isOpen ? <ChevronUp size={18} color="var(--ink-300)" /> : <ChevronDown size={18} color="var(--ink-300)" />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--ink-100)' }}>
                {/* What it means */}
                <div style={{ paddingTop: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>What this means</div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--ink-700)', lineHeight: 1.6 }}>{config.what}</p>
                  {showHindi && <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-500)' }}>{config.whatHi}</p>}
                </div>

                {/* Steps */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Steps to resolve</div>
                  <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {config.steps.map((step, i) => (
                      <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{
                          flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
                          background: 'var(--brand)', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 700, marginTop: '2px',
                        }}>{i + 1}</span>
                        <span style={{ fontSize: '13.5px', color: 'var(--ink-700)', lineHeight: 1.5 }}>
                          {step}
                          {showHindi && <span className="lang-hi" style={{ display: 'block', marginTop: '2px' }}>{config.stepsHi[i]}</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Time estimate */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 'var(--r-md)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ink-500)' }}>⏱ Estimated time to fix:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-900)' }}>{config.timeEstimate}</span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {config.docType && (
                    <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ gap: '8px', fontSize: '14px', flex: '1 1 auto', minWidth: '200px' }}>
                      {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><FileText size={15} /> {config.docLabel}</>}
                    </button>
                  )}
                  {config.showComplaint && (
                    <>
                    <button onClick={handleComplaint} disabled={complaintLoading} className="btn-ghost" style={{ gap: '8px', fontSize: '14px', flex: '1 1 auto' }}>
                      {complaintLoading ? <Loader2 size={15} className="animate-spin" /> : (copied ? <CheckCheck size={15} color="var(--pass)" /> : <Clipboard size={15} />)}
                      {copied ? 'Copied!' : 'Copy EPFiGMS Text'}
                    </button>
                    <a
                      href="https://epfigms.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                      style={{ gap: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                    >
                      <ExternalLink size={14} /> File on EPFiGMS Portal
                    </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {modalDoc && (
        <DocumentModal
          content={modalDoc.content}
          docType={modalDoc.type}
          onClose={() => setModalDoc(null)}
        />
      )}
    </>
  )
}
