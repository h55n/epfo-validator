import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, ExternalLink, ChevronDown, BookOpen, HelpCircle, FileText, Globe, ArrowLeft } from 'lucide-react'

const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Activate Your UAN',
    time: 'One time',
    desc: 'Your employer will share your UAN (Universal Account Number). Activate it at the UAN Member Portal using your mobile number linked to Aadhaar.',
    link: { label: 'UAN Member Portal', url: 'https://unifiedportal-mem.epfindia.gov.in' },
    hindi: 'अपने UAN को सक्रिय करें',
  },
  {
    step: '02',
    title: 'Complete KYC (Aadhaar, PAN, Bank)',
    time: '2 to 5 days',
    desc: 'Login to the UAN portal, go to KYC section. Link your Aadhaar, PAN, and bank account. Your employer must approve the bank KYC before it is activated.',
    link: { label: 'KYC Guide — EPFO', url: 'https://www.epfindia.gov.in/site_en/kyc.php' },
    hindi: 'KYC पूरा करें (आधार, PAN, बैंक)',
  },
  {
    step: '03',
    title: 'Ensure Employer Updates Your Exit Date',
    time: 'Within 2 months of leaving',
    desc: 'After leaving a job, your employer must mark your exit date in the UAN Employer Portal. Without this, EPFO cannot process Final Settlement (Form-19/10C).',
    link: { label: 'Employer Portal', url: 'https://unifiedportal-emp.epfindia.gov.in' },
    hindi: 'नियोक्ता से निकास तिथि अपडेट कराएं',
  },
  {
    step: '04',
    title: 'Resolve Any Discrepancies First',
    time: '15 to 60 days',
    desc: 'If name or date of birth differs between EPF records and Aadhaar, you must submit a Joint Declaration at your EPFO regional office before claiming. Use our app to identify and draft this.',
    link: null,
    hindi: 'किसी भी विसंगति को हल करें',
  },
  {
    step: '05',
    title: 'Submit Your PF Claim Online',
    time: '1 day',
    desc: 'Login to the UAN portal. Go to Online Services then Claim (Form-31/19/10C/10D). Choose your claim type, verify your bank account, and submit.',
    link: { label: 'Claim Online — EPFO', url: 'https://unifiedportal-mem.epfindia.gov.in' },
    hindi: 'अपना PF दावा ऑनलाइन जमा करें',
  },
  {
    step: '06',
    title: 'Track Your Claim Status',
    time: '20 to 30 working days',
    desc: 'Track your claim status on the EPFO portal or via SMS. You will receive the amount via NEFT to your registered bank account. Processing typically takes 20 to 30 working days.',
    link: { label: 'Track Claim — EPFO', url: 'https://passbook.epfindia.gov.in/MemberPassBook/Login' },
    hindi: 'अपने दावे की स्थिति ट्रैक करें',
  },
  {
    step: '07',
    title: 'Escalate via EPFiGMS if Needed',
    time: 'If delayed beyond 30 days',
    desc: 'If your claim is stuck or rejected without reason, file a grievance on EPFiGMS — the official EPFO grievance management system. Most grievances are resolved within 30 days.',
    link: { label: 'EPFiGMS Portal', url: 'https://epfigms.gov.in' },
    hindi: 'EPFiGMS पर शिकायत दर्ज करें',
  },
]

const FAQS = [
  { q: 'How do I check my PF balance?', a: 'You can check your PF balance on the EPFO Passbook portal (passbook.epfindia.gov.in), by giving a missed call to 011-22901406 from your registered mobile, or by sending SMS "EPFOHO UAN ENG" to 7738299899.' },
  { q: 'How long does a PF claim take to process?', a: 'Online PF claims typically take 15 to 20 working days. If documents are complete and KYC is verified, some claims settle in 5 to 7 days. Physical claims submitted at EPFO office may take 30 to 45 days.' },
  { q: 'My employer is not updating my exit date. What can I do?', a: 'First, send a written request to your employer\'s HR department (use our Employer Letter generator). If they don\'t respond within 15 days, file a grievance on EPFiGMS under "Non-transfer / Exit date not updated".' },
  { q: 'What is a Joint Declaration and when do I need it?', a: 'A Joint Declaration is a form signed by both you and your employer, submitted to your EPFO regional office to correct name or date of birth discrepancies in your EPF records. You need it whenever the name in your EPF record does not exactly match your Aadhaar card.' },
  { q: 'Can I withdraw my full PF balance immediately after leaving a job?', a: 'Not immediately. EPFO requires a 2-month waiting period after your last working day before you can apply for full withdrawal (Form-19). You can withdraw the employee share immediately (Form-31), but the employer share has a waiting period.' },
  { q: 'What is UAN and how do I get it?', a: 'UAN (Universal Account Number) is a 12-digit number assigned by EPFO that stays with you across all jobs. Your employer creates it when you join. You can find it on your payslip or by contacting your HR department. Activate it at the UAN Member Portal.' },
  { q: 'My PF claim was rejected. What should I do?', a: 'First, check the rejection reason in the UAN portal under "Track Claim Status". Common reasons include incomplete KYC, bank account mismatch, or exit date not updated. Fix the specific issue and resubmit. If you believe it was rejected in error, file a grievance on EPFiGMS.' },
  { q: 'Can I transfer my PF instead of withdrawing?', a: 'Yes, you can transfer your PF to your new employer\'s account using Form-13 (online at the UAN portal). This is recommended as it preserves your EPF continuity and saves tax. Transfers are typically faster than withdrawals.' },
  { q: 'What documents do I need for a PF claim?', a: 'For online claims via UAN portal: no physical documents are required. Your KYC (Aadhaar, PAN, bank account) must be verified. For offline claims: Form-19/10C, Aadhaar, cancelled cheque, and employer signature may be needed.' },
  { q: 'How do I contact EPFO directly?', a: 'EPFO Helpline: 1800-118-005 (toll-free, Mon-Sat 9am to 6pm). Email: employeefeedback@epfindia.gov.in. You can also visit your nearest EPFO regional office. Find it via the office locator at epfindia.gov.in.' },
]

const OFFICIAL_LINKS = [
  { title: 'UAN Member Portal', desc: 'Login, check balance, update KYC, submit claims online', url: 'https://unifiedportal-mem.epfindia.gov.in', icon: '🏛️' },
  { title: 'EPFO Official Website', desc: 'Forms, circulars, regional office contacts, news', url: 'https://www.epfindia.gov.in', icon: '🌐' },
  { title: 'EPFiGMS Grievance Portal', desc: 'File and track complaints about EPFO services', url: 'https://epfigms.gov.in', icon: '📋' },
  { title: 'EPFO Passbook and Balance', desc: 'View your EPF passbook and check balance history', url: 'https://passbook.epfindia.gov.in', icon: '📒' },
  { title: 'UIDAI Aadhaar Portal', desc: 'Correct your Aadhaar name, date of birth, or address', url: 'https://myaadhaar.uidai.gov.in', icon: '🪪' },
  { title: 'EPFO Office Locator', desc: 'Find your nearest EPFO regional or district office', url: 'https://www.epfindia.gov.in/site_en/About_Us_Regional_Offices.php', icon: '📍' },
  { title: 'UMANG App', desc: 'Access EPFO services on mobile (Android and iOS)', url: 'https://web.umang.gov.in/landing/department/epfo.html', icon: '📱' },
  { title: 'DigiLocker', desc: 'Store and share your Aadhaar, PAN digitally', url: 'https://www.digilocker.gov.in', icon: '🔐' },
]

const GLOSSARY = [
  { term: 'UAN', def: 'Universal Account Number — a 12-digit number that stays with you across all jobs and is used to access all EPFO services.' },
  { term: 'EPFiGMS', def: 'EPF i-Grievance Management System — the official EPFO portal to file complaints and track their resolution.' },
  { term: 'KYC', def: 'Know Your Customer — verification of your identity documents (Aadhaar, PAN) and bank account by linking them to your UAN.' },
  { term: 'Joint Declaration', def: 'A form signed by both you and your employer to correct name or date of birth discrepancies in EPF records. Submitted to your EPFO regional office.' },
  { term: 'Form-19', def: 'The PF withdrawal form for Final Settlement of your EPF account when you leave employment.' },
  { term: 'Form-10C', def: 'Used to claim the pension (EPS) portion of your PF, applicable after 6 months of service.' },
  { term: 'Form-31', def: 'Used for partial PF withdrawal for specific purposes (medical, marriage, home loan, etc.).' },
  { term: 'EPS', def: 'Employees Pension Scheme — 8.33% of employer PF contribution goes into this pension fund.' },
  { term: 'EPF', def: 'Employees Provident Fund — 12% of your basic salary matched by employer goes here.' },
  { term: 'NEFT', def: 'National Electronic Funds Transfer — the method used by EPFO to credit PF amounts to your bank account.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="help-faq-item">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="help-faq-btn"
      >
        <span>{q}</span>
        <ChevronDown size={16} className={open ? 'help-chevron open' : 'help-chevron'} aria-hidden="true" />
      </button>
      {open && (
        <div className="help-faq-body">{a}</div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <nav className="landing-nav" aria-label="Primary navigation">
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand-lockup">
            <ShieldCheck size={21} aria-hidden="true" />
            <span>EPFO Validator</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="button" onClick={() => navigate('/')} className="btn-ghost" style={{ gap: '6px', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={15} /> Home
            </button>
            <button type="button" onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Try Demo <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ marginBottom: '56px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--brand-light)', color: 'var(--brand-text)', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, marginBottom: '18px' }}>
            <BookOpen size={14} /> Help and Guidance
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, color: 'var(--ink-900)', marginBottom: '12px', lineHeight: 1.2 }}>
            How PF Claims Actually Work
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--ink-500)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.65 }}>
            A plain-language guide to the full EPF withdrawal process — whether you use our app or do it yourself on the official EPFO portals.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', marginTop: '8px' }}>पीएफ दावे की पूरी प्रक्रिया की सरल भाषा में जानकारी</p>
        </div>

        <section aria-labelledby="journey-title" style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <Globe size={20} color="var(--brand)" />
            <h2 id="journey-title" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              Step-by-Step PF Claim Journey
            </h2>
          </div>
          <div className="help-journey">
            {JOURNEY_STEPS.map((s, i) => (
              <div key={s.step} className="help-journey-step">
                <div className="help-journey-left">
                  <div className="help-journey-num">{s.step}</div>
                  {i < JOURNEY_STEPS.length - 1 && <div className="help-journey-line" />}
                </div>
                <div className="help-journey-body">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink-900)' }}>{s.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '2px' }}>{s.hindi}</div>
                    </div>
                    <span style={{ background: 'var(--brand-light)', color: 'var(--brand-text)', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {s.time}
                    </span>
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: '13.5px', color: 'var(--ink-700)', lineHeight: 1.65 }}>{s.desc}</p>
                  {s.link && (
                    <a href={s.link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '12.5px', color: 'var(--brand-text)', fontWeight: 600, textDecoration: 'none' }}>
                      <ExternalLink size={12} /> {s.link.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="links-title" style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Globe size={20} color="var(--brand)" />
            <h2 id="links-title" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              Official Portals and Resources
            </h2>
          </div>
          <div className="help-links-grid">
            {OFFICIAL_LINKS.map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="help-link-card">
                <span style={{ fontSize: '24px' }}>{link.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {link.title} <ExternalLink size={11} color="var(--ink-300)" />
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--ink-500)', marginTop: '3px', lineHeight: 1.5 }}>{link.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="faq-title" style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <HelpCircle size={20} color="var(--brand)" />
            <h2 id="faq-title" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="help-faq-list">
            {FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </section>

        <section aria-labelledby="glossary-title" style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <FileText size={20} color="var(--brand)" />
            <h2 id="glossary-title" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              Glossary of Terms
            </h2>
          </div>
          <div className="help-glossary">
            {GLOSSARY.map(g => (
              <div key={g.term} className="help-glossary-item">
                <dt style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--brand-text)', minWidth: '140px' }}>{g.term}</dt>
                <dd style={{ fontSize: '13.5px', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>{g.def}</dd>
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: 'center', padding: '36px', background: 'var(--brand-light)', borderRadius: 'var(--r-xl)', border: '1px solid #c8d7ef' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand)', marginBottom: '8px' }}>Ready to check your claim eligibility?</h3>
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', marginBottom: '20px' }}>Use our demo to identify issues before you submit to EPFO.</p>
          <button type="button" onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize: '14px', padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Try the Demo <ArrowRight size={16} />
          </button>
        </div>

      </main>

      <footer className="landing-footer" style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--ink-300)' }}>
        Independent hackathon prototype · Not affiliated with EPFO or the Government of India
      </footer>
    </div>
  )
}

