'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import type { WorkflowItem } from '@/types/workflow'

const BG2 = '#141416'
const BG3 = '#1A1A1E'
const BD = 'rgba(192,192,200,0.10)'
const TEXT = '#E2E2E8'
const T2 = '#9A9AAA'
const T3 = '#62626E'
const FONT = 'Inter, DM Sans, system-ui, sans-serif'

const STATUSES = [
  { id: 'pending',     label: 'Pending',     color: '#3B82F6', bgColor: 'rgba(59,130,246,0.10)' },
  { id: 'in_review',  label: 'In Review',   color: '#F59E0B', bgColor: 'rgba(245,158,11,0.10)' },
  { id: 'awaiting_uw', label: 'Awaiting UW', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.10)' },
  { id: 'bound',      label: 'Bound',       color: '#22C55E', bgColor: 'rgba(34,197,94,0.10)' },
]

function urgencyInfo(daysLeft?: number) {
  if (daysLeft === undefined) return { color: '#22C55E', label: '—' }
  if (daysLeft < 0)  return { color: '#EF4444', label: `${Math.abs(daysLeft)}d OVERDUE` }
  if (daysLeft <= 7)  return { color: '#EF4444', label: `${daysLeft}d URGENT` }
  if (daysLeft <= 14) return { color: '#F59E0B', label: `${daysLeft}d ACTION` }
  return { color: '#22C55E', label: `${daysLeft}d` }
}

function WorkflowCard({ item, onClick }: { item: WorkflowItem; onClick?: () => void }) {
  const href = item.type === "renewal" ? "/renewals" : "/submissions"
  const urgency = urgencyInfo(item.daysUntilExpiry)
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? BG3 : BG2,
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : BD}`,
        borderRadius: 8,
        padding: "7px 10px",
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: FONT,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 12 }}>{item.type === 'renewal' ? '🔄' : '📋'}</span>
        <span style={{
          fontSize: 8, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.05)', color: T3, padding: '2px 5px', borderRadius: 3,
        }}>
          {item.type}
        </span>
      </div>

      <div style={{
        fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 4, lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
      }}>
        {item.clientName}
      </div>

      <div style={{ fontSize: 9, color: T3, marginBottom: 5, fontFamily: 'monospace' }}>
        {item.policyNumber || item.trackingNumber || '—'}
      </div>

      <div style={{ fontSize: 9, color: T2, marginBottom: 4, textTransform: 'capitalize' }}>
        {item.policyType}
      </div>

      <div style={{ fontSize: 9, color: T3, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.carrier && item.carrier !== '—' ? item.carrier : '—'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${BD}`, paddingTop: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: TEXT }}>
          ${item.premium.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
        <span style={{
          fontSize: 8, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase',
          color: urgency.color, padding: '2px 5px', background: `${urgency.color}18`, borderRadius: 3,
        }}>
          {urgency.label}
        </span>
      </div>
    </Link>
  )
}

function KanbanColumn({
  status,
  items,
  onCardClick,
}: {
  status: (typeof STATUSES)[0]
  items: WorkflowItem[]
  onCardClick?: (item: WorkflowItem) => void
}) {
  return (
    <div style={{
      flex: '0 0 290px',
      background: BG2,
      border: `1px solid ${BD}`,
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: FONT,
    }}>
      <div style={{
        padding: '12px 14px',
        background: status.bgColor,
        borderBottom: `1px solid ${BD}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: status.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{status.label}</span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600,
          background: 'rgba(192,192,200,0.10)', color: T3,
          padding: '2px 8px', borderRadius: 6,
        }}>
          {items.length}
        </span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto', maxHeight: 520, height: 520,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 420,
      }}>
        {items.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T3, fontSize: 11, fontStyle: 'italic',
          }}>
            No items
          </div>
        ) : (
          items.slice(0,6).map(item => (
            <WorkflowCard key={item.id} item={item} onClick={() => onCardClick?.(item)} />
          ))
        )}
      </div>
    </div>
  )
}

interface WorkflowKanbanProps {
  onCardClick?: (item: WorkflowItem) => void
  refreshKey?: number
}

export default function WorkflowKanban({ onCardClick, refreshKey }: WorkflowKanbanProps) {
  const [items, setItems] = useState<WorkflowItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/workflow-items?limit=100&sortBy=expiryDate&order=asc')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setItems(data.items || [])
      } catch (err) {
        setError(String(err))
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshKey])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: T3, fontFamily: FONT }}>
        <div style={{ fontSize: 12, marginBottom: 6 }}>Loading workflow items…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: 20, background: 'rgba(239,68,68,0.05)',
        border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
        color: '#EF4444', fontSize: 11, fontFamily: FONT,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Error loading items</div>
        <div style={{ opacity: 0.8 }}>{error}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, fontFamily: FONT }}>
      {STATUSES.map(status => (
        <KanbanColumn
          key={status.id}
          status={status}
          items={items.filter(i => i.status === status.id)}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  )
}
