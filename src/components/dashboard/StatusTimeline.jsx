import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'

const STAGES = [
  { label: 'Field Office Verification', duration: '3–7 days',   status: 'done' },
  { label: 'Accounts Processing',       duration: '5–10 days',  status: 'current' },
  { label: 'Bank Transfer',             duration: '2–3 days',   status: 'pending' },
]

export default function StatusTimeline({ reference: _reference }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {STAGES.map((stage, i) => (
        <motion.div
          key={stage.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: i < STAGES.length - 1 ? '20px' : 0, position: 'relative' }}
        >
          {/* Connector line */}
          {i < STAGES.length - 1 && (
            <div style={{ position: 'absolute', left: '11px', top: '22px', width: '2px', height: 'calc(100% - 4px)', background: stage.status === 'done' ? 'var(--pass)' : 'var(--ink-100)' }} />
          )}
          {/* Icon */}
          {stage.status === 'done'
            ? <CheckCircle size={24} color="var(--pass)" style={{ flexShrink: 0, background: 'var(--surface)', borderRadius: '50%' }} />
            : <Circle size={24} color={stage.status === 'current' ? 'var(--brand)' : 'var(--ink-200)'} style={{ flexShrink: 0 }} />
          }
          {/* Text */}
          <div>
            <div style={{ fontWeight: stage.status === 'current' ? 700 : 500, fontSize: '14px', color: stage.status === 'pending' ? 'var(--ink-300)' : 'var(--ink-900)' }}>
              {stage.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-500)', marginTop: '2px' }}>{stage.duration}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
