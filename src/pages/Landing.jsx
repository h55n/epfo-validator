import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Sparkles, ChevronDown, HelpCircle } from 'lucide-react'

const CHECKS = [
  { title: 'Name match', hindi: 'नाम मिलान', description: 'Compares the name recorded in EPF with the name shown in Aadhaar.', outcome: 'If there is a mismatch, you see why it matters and can prepare a Joint Declaration draft.' },
  { title: 'Date of birth', hindi: 'जन्म तिथि', description: 'Checks that date of birth entries agree across the two records.', outcome: 'If they differ, you get a clear correction path and the documents to gather.' },
  { title: 'Employer exit', hindi: 'नियोक्ता निकास', description: 'Checks whether your previous employer has recorded your exit date.', outcome: 'If it is missing, you receive an employer follow-up and EPFiGMS escalation path.' },
  { title: 'Bank KYC', hindi: 'बैंक KYC', description: 'Checks that your linked bank account is employer-approved.', outcome: 'If approval is pending, you get the fastest next step to complete KYC.' },
]

const STEPS = [
  ['Choose a demo account', 'Start with a realistic claim scenario.'],
  ['Run the pre-check', 'See each issue before a claim is sent.'],
  ['Follow a clear fix path', 'Use plain-language steps and a draft document.'],
]

const SCENARIOS = [
  { title: 'Name mismatch', body: 'See how an initial-versus-full-name difference is explained and resolved.', tone: 'fail' },
  { title: 'Multiple issues', body: 'See employer exit and bank KYC fixes in one guided journey.', tone: 'advisory' },
  { title: 'Ready to submit', body: 'See the short happy path once all pre-checks pass.', tone: 'pass' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [openCheckIndex, setOpenCheckIndex] = useState(null)

  const toggleCheck = (i) => setOpenCheckIndex(prev => prev === i ? null : i)

  return (
    <div className="landing-page">
      <div className="prototype-banner">
        <strong>HACKATHON PROTOTYPE</strong><span aria-hidden="true"> · </span>Uses mock data only. No real PF claim is submitted.
      </div>

      <nav className="landing-nav" aria-label="Primary navigation">
        <div className="landing-container landing-nav-inner">
          <div className="brand-lockup">
            <ShieldCheck size={21} aria-hidden="true" />
            <span>EPFO Validator</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="button" onClick={() => navigate('/help')} className="btn-ghost" style={{ gap: '6px', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
              <HelpCircle size={15} aria-hidden="true" /> Help
            </button>
          <button type="button" onClick={() => navigate('/login')} className="btn-primary landing-nav-cta">
            Try demo <ArrowRight size={15} aria-hidden="true" />
          </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="landing-eyebrow"><Sparkles size={14} aria-hidden="true" /> Claim pre-validation</div>
              <h1>Know what needs fixing <em>before</em> you submit.</h1>
              <p className="landing-hindi">दावा जमा करने से पहले जानें कि क्या सुधारना है।</p>
              <p className="landing-lede">
                A guided demo that checks common PF claim blockers, explains them clearly, and prepares the next step.
              </p>
              <div className="landing-actions">
                <button type="button" onClick={() => navigate('/login')} className="landing-primary-action">
                  Start the demo <ArrowRight size={17} aria-hidden="true" />
                </button>
                <a href="#how-it-works" className="landing-secondary-action">How it works</a>
              </div>
              <p className="landing-assurance"><ShieldCheck size={15} aria-hidden="true" /> No account setup · Mock data · Bilingual guidance</p>
            </div>

            <aside className="landing-check-panel" aria-labelledby="checks-title">
              <div className="landing-panel-label">Before you submit</div>
              <h2 id="checks-title">Four checks, one clear next step.</h2>
              <ul className="landing-check-list">
                {CHECKS.map((check) => (
                  <li key={check.title}><CheckCircle2 size={17} aria-hidden="true" />{check.title}</li>
                ))}
              </ul>
              <div className="landing-panel-note"><FileText size={16} aria-hidden="true" /> Draft documents are clearly marked as prototype-only.</div>
            </aside>
          </div>
        </section>

        <section id="how-it-works" className="landing-section" aria-labelledby="how-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <div>
                <div className="landing-kicker">Simple by design</div>
                <h2 id="how-title">A short, guided path</h2>
              </div>
              <p>Only the information needed to move forward—no unexplained rejection codes.</p>
            </div>
            <ol className="landing-steps">
              {STEPS.map(([title, body], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </li>
              ))}
            </ol>

            <div className="landing-explainer" aria-labelledby="check-details-title">
              <div className="landing-explainer-header">
                <div>
                  <div className="landing-kicker">What the demo checks</div>
                  <h3 id="check-details-title">Understand each result in plain language</h3>
                </div>
                <p>Open a check for the record comparison and the resolution you will receive.</p>
              </div>
              <div className="landing-detail-grid">
                {CHECKS.map((check, i) => (
                  <div key={check.title} className="landing-detail" data-open={openCheckIndex === i}>
                    <button
                      type="button"
                      onClick={() => toggleCheck(i)}
                      aria-expanded={openCheckIndex === i}
                      className="landing-detail-summary"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} aria-hidden="true" />{check.title}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="landing-detail-hindi">{check.hindi}</span>
                        <ChevronDown size={15} className={openCheckIndex === i ? 'check-chevron open' : 'check-chevron'} aria-hidden="true" />
                      </span>
                    </button>
                    {openCheckIndex === i && (
                      <div className="landing-detail-body">
                        <p>{check.description}</p>
                        <p><strong>Your next step:</strong> {check.outcome}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="landing-boundary">
                <ShieldCheck size={17} aria-hidden="true" />
                <p><strong>Clear boundaries:</strong> This demo uses mock records only. Eligibility and submission decisions must always be confirmed against official EPFO rules and your actual records.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-scenarios" aria-labelledby="scenarios-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <div>
                <div className="landing-kicker">Demo scenarios</div>
                <h2 id="scenarios-title">Choose a journey to explore</h2>
              </div>
              <button type="button" onClick={() => navigate('/login')} className="btn-secondary">View demo accounts <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
            <div className="landing-scenario-grid">
              {SCENARIOS.map((scenario) => (
                <button type="button" key={scenario.title} className="landing-scenario" onClick={() => navigate('/login')}>
                  <span className={`badge badge-${scenario.tone}`}>{scenario.title}</span>
                  <p>{scenario.body}</p>
                  <span className="landing-scenario-link">Explore scenario <ArrowRight size={14} aria-hidden="true" /></span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>Independent hackathon prototype · Not affiliated with EPFO or the Government of India</span>
        <span style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px', fontSize: '13px' }}>
          <button type="button" onClick={() => navigate('/help')} style={{ background: 'none', border: 'none', color: 'var(--brand-text)', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', fontFamily: 'inherit' }}>Help &amp; Guide</button>
          <a href="https://epfindia.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-text)', textDecoration: 'underline' }}>EPFO Official</a>
          <a href="https://epfigms.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-text)', textDecoration: 'underline' }}>EPFiGMS Portal</a>
        </span>
      </footer>
    </div>
  )
}
