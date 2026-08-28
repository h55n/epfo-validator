import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Printer, ExternalLink } from 'lucide-react'
import { downloadDocumentAsPDF } from '../../lib/pdfGenerator'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import toast from 'react-hot-toast'

const DOC_TITLES = {
  jointDeclaration: 'Joint Declaration for Name Correction',
  employerLetter:   'Employer Escalation Letter',
  epfigmsText:      'EPFiGMS Complaint Text',
}

/**
 * Render document content as structured HTML.
 * Handles: section separators (dashes), blank lines, ALL-CAPS headings,
 * label : value pairs, and numbered lists.
 * Uses textContent-safe rendering — no HTML injection.
 */
function renderDocumentContent(content) {
  if (!content) return null
  const lines = content.split('\n')
  const elements = []
  let key = 0

  lines.forEach(line => {
    const trimmed = line.trim()
    key++

    // Disclaimer brackets at top
    if (trimmed.startsWith('[DRAFT DOCUMENT') || trimmed.startsWith('[Verify all')) {
      elements.push(
        <div key={key} style={{ fontSize: '11px', color: '#b45309', background: '#fef9ec', padding: '6px 10px', borderRadius: '4px', marginBottom: '4px', fontStyle: 'italic' }}>
          {trimmed.replace(/^\[/, '').replace(/\]$/, '')}
        </div>
      )
      return
    }

    // Separator line (dashes)
    if (/^-{4,}$/.test(trimmed)) {
      elements.push(<hr key={key} style={{ border: 'none', borderTop: '1px solid #d1ccc4', margin: '10px 0' }} />)
      return
    }

    // Blank line
    if (!trimmed) {
      elements.push(<div key={key} style={{ height: '8px' }} />)
      return
    }

    // ALL CAPS headings
    const isHeading = trimmed === trimmed.toUpperCase() && trimmed.length > 4 && !/^\d+\./.test(trimmed)
    if (isHeading) {
      elements.push(
        <div key={key} style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.06em', color: '#1a2e52', marginTop: '6px', marginBottom: '2px' }}>
          {trimmed}
        </div>
      )
      return
    }

    // Numbered list items
    if (/^\d+\./.test(trimmed)) {
      elements.push(
        <div key={key} style={{ display: 'flex', gap: '8px', fontSize: '12.5px', lineHeight: 1.65, color: '#3d3830', paddingLeft: '4px' }}>
          <span>{trimmed}</span>
        </div>
      )
      return
    }

    // Label : Value lines (contain colon alignment)
    if (trimmed.includes(' : ') || trimmed.match(/^[A-Za-z &.().-]+\s{2,}:/)) {
      elements.push(
        <div key={key} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#141210', lineHeight: 1.7, whiteSpace: 'pre' }}>
          {line}
        </div>
      )
      return
    }

    // Normal paragraph text
    elements.push(
      <p key={key} style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: '#3d3830' }}>
        {trimmed}
      </p>
    )
  })

  return elements
}

export default function DocumentModal({ content, docType, onClose }) {
  const contentRef = useRef(null)
  const dialogRef = useFocusTrap(true, onClose)

  const handleDownload = async () => {
    const filename = `EPFO-${docType}-${Date.now()}.pdf`
    try {
      const success = await downloadDocumentAsPDF(content, filename)
      if (success) toast.success('PDF downloaded!', { icon: '📄' })
      else toast.error('PDF failed. Use Print instead.')
    } catch {
      toast.error('PDF failed. Use Print instead.')
    }
  }

  const handlePrint = () => {
    let printWindow
    try {
      printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        toast.error('Print blocked by browser. Please allow pop-ups for this page.')
        return
      }
    } catch {
      toast.error('Could not open print window.')
      return
    }

    const doc = printWindow.document
    doc.open()
    doc.write(`<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<title>EPFO Document</title>
<style>
  body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; line-height: 1.75; font-size: 13px; color: #1a1a1a; }
  pre { font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; }
  #content { white-space: pre-wrap; word-wrap: break-word; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-45deg); font-size: 80px; color: rgba(0,0,0,0.04); pointer-events: none; user-select: none; font-family: sans-serif; font-weight: 900; }
  .disclaimer { margin-top: 32px; padding: 12px; border: 1px solid #d4a017; background: #fef9ec; font-size: 11px; color: #78350f; font-family: sans-serif; }
  @media print { .no-print { display: none; } }
</style>
</head><body>
<div class="watermark" aria-hidden="true">DRAFT</div>
<div id="title"></div>
<div id="content"></div>
<div class="disclaimer" id="disclaimer"></div>
</body></html>`)
    doc.close()

    const title = doc.getElementById('title')
    if (title) {
      const h2 = doc.createElement('h2')
      h2.textContent = DOC_TITLES[docType] || 'EPFO Document'
      title.appendChild(h2)
    }

    const pre = doc.getElementById('content')
    if (pre) pre.textContent = content

    const disclaimer = doc.getElementById('disclaimer')
    if (disclaimer) {
      disclaimer.textContent = 'DRAFT — Pre-filled with mock data for demonstration only. Not an official EPFO document.'
    }

    setTimeout(() => {
      try { printWindow.print() }
      catch { toast.error('Print failed. Try downloading as PDF instead.') }
    }, 300)
  }

  const isEPFiGMS = docType === 'epfigmsText'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: '720px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
        >
          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', flexShrink: 0 }}>
            <div>
              <div id="document-modal-title" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink-900)' }}>{DOC_TITLES[docType] || 'Generated Document'}</div>
              <div style={{ fontSize: '11px', color: 'var(--ink-500)', marginTop: '2px' }}>Pre-filled with demo account data · Review before use</div>
            </div>
            <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-500)', padding: '4px', borderRadius: 'var(--r-sm)', lineHeight: 0 }}>
              <X size={20} />
            </button>
          </div>

          {/* Document content — scrollable */}
          <div
            ref={contentRef}
            tabIndex={0}
            role="region"
            aria-label="Document content"
            style={{ flex: 1, overflow: 'auto', padding: '24px 28px', outline: 'none', background: '#fafaf9' }}
          >
            <div style={{ background: 'white', borderRadius: '8px', padding: '28px 32px', border: '1px solid #e8e4dc', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {renderDocumentContent(content)}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--ink-100)', background: 'var(--surface-2)', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
            <button onClick={handleDownload} className="btn-primary" style={{ gap: '7px', fontSize: '13px', flex: '1 1 auto', minHeight: 42 }}>
              <Download size={14} /> Download PDF
            </button>
            <button onClick={handlePrint} className="btn-ghost" style={{ gap: '7px', fontSize: '13px', minHeight: 42 }}>
              <Printer size={14} /> Print
            </button>
            {isEPFiGMS && (
              <a
                href="https://epfigms.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ gap: '7px', fontSize: '13px', minHeight: 42, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <ExternalLink size={14} /> File on EPFiGMS Portal
              </a>
            )}
            <button onClick={onClose} className="btn-ghost" style={{ fontSize: '13px', minHeight: 42 }}>Close</button>
          </div>

          {/* Disclaimer strip */}
          <div style={{ padding: '10px 20px', background: 'var(--warn-bg)', borderTop: '1px solid var(--warn-border)' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--warn-text)', lineHeight: 1.5 }}>
              ⚠ Draft generated from mock data for demonstration purposes. In production, actual EPFO records would be used. Review all details before submission.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
