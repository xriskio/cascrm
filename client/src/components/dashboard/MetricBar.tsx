
import { useState, useEffect } from 'react'

const BG2 = '#141416'
const BG1 = '#0F0F11'
const BD = 'rgba(255,255,255,0.06)'
const TEXT = '#F0F0F2'
const T2 = '#8A8A96'
const T3 = '#52525E'
const RED = '#EF4444'
const AMBER = '#F59E0B'
const GREEN = '#22C55E'
const BLUE = '#3B82F6'
const FONT = 'Inter, DM Sans, system-ui, sans-serif'
const MONO = '"JetBrains Mono", "DM Mono", monospace'

interface Metrics {
  total: number
  byStatus: Record<string, number>
  byType: { renewal: number; submission: number }
  overdue: number
  urgent: number
}

interface MetricBarProps {
  refreshKey?: number
}

function MetricBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '8px 12px',
      background: BG1,
      border: `1px solid ${BD}`,
      borderRadius: 6,
      fontFamily: FONT,
    }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: T3 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, fontFamily: MONO, letterSpacing: '-1px', color }}>
        {value}
      </div>
    </div>
  )
}

export default function MetricBar({ refreshKey }: MetricBarProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    byStatus: {},
    byType: { renewal: 0, submission: 0 },
    overdue: 0,
    urgent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/workflow-items?limit=500')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data.metrics || {})
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshKey])

  const pendingCount = metrics.byStatus['pending'] || 0
  const inReviewCount = metrics.byStatus['in_review'] || 0
  const boundCount = metrics.byStatus['bound'] || 0

  return (
    <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 8, padding: '14px 16px', fontFamily: FONT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded ? 12 : 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>Workflow Metrics</div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: T3, fontSize: 14, padding: '2px 6px', lineHeight: 1,
          }}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {loading && (
        <div style={{ fontSize: 10, color: T3 }}>Loading…</div>
      )}

      {!loading && expanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
          <MetricBox label="Total"       value={metrics.total}             color={BLUE}  />
          <MetricBox label="Pending"     value={pendingCount}              color={AMBER} />
          <MetricBox label="In Review"   value={inReviewCount}             color={AMBER} />
          <MetricBox label="Bound"       value={boundCount}                color={GREEN} />
          <MetricBox label="Overdue"     value={metrics.overdue}           color={RED}   />
          <MetricBox label="Urgent"      value={metrics.urgent}            color={RED}   />
          <MetricBox label="Renewals"    value={metrics.byType.renewal}    color={BLUE}  />
          <MetricBox label="Submissions" value={metrics.byType.submission} color={BLUE}  />
        </div>
      )}

      {!loading && !expanded && (
        <div style={{ fontSize: 10, color: T2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span><strong style={{ color: TEXT }}>{metrics.total}</strong> total</span>
          <span><strong style={{ color: RED }}>{metrics.overdue}</strong> overdue</span>
          <span><strong style={{ color: AMBER }}>{metrics.urgent}</strong> urgent</span>
          <span><strong style={{ color: GREEN }}>{boundCount}</strong> bound</span>
        </div>
      )}
    </div>
  )
}
