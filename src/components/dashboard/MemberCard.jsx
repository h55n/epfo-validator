import { CheckCircle, XCircle } from 'lucide-react'
import { formatIndianCurrency, formatDate } from '../../lib/utils'
import { useValidationStore } from '../../store/validationStore'

export default function MemberCard({ user }) {
  const { showHindi } = useValidationStore()

  const fields = [
    { label: 'Member Name',    labelHi: 'सदस्य नाम',          value: user.memberName },
    { label: 'UAN Number',     labelHi: 'UAN नंबर',            value: user.uan },
    { label: 'Date of Birth',  labelHi: 'जन्म तिथि',          value: user.dob.display },
    { label: 'Establishment',  labelHi: 'प्रतिष्ठान',          value: user.establishmentName },
    { label: 'Date of Joining',labelHi: 'शामिल होने की तिथि', value: formatDate(user.dateOfJoining) },
    {
      label: 'Employer Exit Status',
      labelHi: 'नियोक्ता निकास स्थिति',
      value: user.exitUpdated ? `Updated — ${formatDate(user.employerExitDate)}` : 'Not Updated',
      valueColor: user.exitUpdated ? 'var(--pass)' : 'var(--fail)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Balance card — single solid brand color, no gradient */}
      <div style={{
        background: 'var(--brand)',
        borderRadius: 'var(--r-lg)',
        padding: '28px 24px',
        color: 'white',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Your PF Balance {showHindi && <span className="lang-hi" style={{ color: 'rgba(255,255,255,0.5)', display: 'inline', textTransform: 'none', letterSpacing: 0 }}>/ आपकी PF राशि</span>}
        </div>
        <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {formatIndianCurrency(user.pfBalance)}
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '12px', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
          <span>Employee Share: {formatIndianCurrency(Math.round(user.pfBalance / 2))}</span>
          <span>Employer Share: {formatIndianCurrency(Math.round(user.pfBalance / 2))}</span>
          <span style={{ marginLeft: 'auto' }}>Last updated: March 2026</span>
        </div>
      </div>

      {/* Member info */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink-900)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Member Information
          {showHindi && <span className="lang-hi">सदस्य जानकारी</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px 24px' }}>
          {fields.map(({ label, labelHi, value, valueColor }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {label}
                {showHindi && <span className="lang-hi" style={{ textTransform: 'none', letterSpacing: 0, display: 'block' }}>{labelHi}</span>}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: valueColor || 'var(--ink-900)', lineHeight: 1.3 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank account */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Bank Account {showHindi && <span className="lang-hi" style={{ textTransform: 'none', letterSpacing: 0, display: 'inline' }}>/ बैंक खाता</span>}
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink-900)', fontFamily: 'monospace' }}>{user.bankAccount.maskedNumber}</div>
            <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '3px' }}>
              {user.bankAccount.bankName} · {user.bankAccount.ifsc}
            </div>
          </div>
          {user.bankAccount.kycVerified
            ? <span className="badge badge-pass"><CheckCircle size={11} /> KYC Verified</span>
            : <span className="badge badge-fail"><XCircle size={11} /> KYC Pending</span>
          }
        </div>
      </div>
    </div>
  )
}
