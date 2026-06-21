'use client'

import { useState, useCallback } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import MetricBar from '@/components/dashboard/MetricBar'
import WorkflowKanban from '@/components/dashboard/WorkflowKanban'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import NewSubmissionModal from '@/components/dashboard/NewSubmissionModal'
import type { SubmissionData } from '@/components/dashboard/NewSubmissionModal'
import type { WorkflowItem } from '@/types/workflow'

const BG = '#0A0A0B'
const BG1 = '#0F0F11'
const BG2 = '#141416'
const BD = 'rgba(192,192,200,0.10)'
const TEXT = '#E2E2E8'
const T2 = '#9A9AAA'
const T3 = '#62626E'
const FONT = 'Inter, DM Sans, system-ui, sans-serif'
const GREEN = '#22C55E'

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      background: '#1A1A1E', color: TEXT,
      border: '1px solid rgba(255,255,255,0.10)',
      padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: 7,
      zIndex: 400, fontFamily: FONT,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
      {message}
    </div>
  )
}

function WorkflowDetailPanel({
  item,
  onClose,
  onStatusChange,
}: {
  item: WorkflowItem | null
  onClose: () => void
  onStatusChange?: (itemId: string, newStatus: string) => void
}) {
  if (!item) return null

  const STATUSES = ['pending', 'in_review', 'awaiting_uw', 'bound', 'declined']

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 400,
        background: BG2, borderLeft: `1px solid ${BD}`,
        zIndex: 101, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', fontFamily: FONT,
      }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{item.clientName}</div>
            <div style={{ fontSize: 10, color: T3 }}>{item.policyNumber || item.trackingNumber || '—'}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: T2, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 6 }}>Type</div>
            <div style={{ fontSize: 11, color: TEXT }}>{item.type === 'renewal' ? '🔄 Renewal' : '📋 Submission'}</div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 6 }}>Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange?.(item.id, s); onClose() }}
                  style={{
                    padding: '8px 10px',
                    background: item.status === s ? '#3B82F6' : BG1,
                    color: item.status === s ? TEXT : T2,
                    border: `1px solid ${item.status === s ? '#3B82F6' : BD}`,
                    borderRadius: 4, cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, fontFamily: FONT,
                    textAlign: 'left', textTransform: 'capitalize',
                  }}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>Policy Type</div>
              <div style={{ fontSize: 11, color: T2 }}>{item.policyType}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>Carrier</div>
              <div style={{ fontSize: 11, color: T2 }}>{item.carrier || '—'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>Premium</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>
              ${item.premium.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>

          {item.expiryDate && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>Expiry Date</div>
              <div style={{ fontSize: 11, color: T2 }}>
                {new Date(item.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              {item.daysUntilExpiry !== undefined && (
                <div style={{ fontSize: 10, color: T3, marginTop: 4 }}>
                  {item.daysUntilExpiry < 0
                    ? `${Math.abs(item.daysUntilExpiry)} days overdue`
                    : `${item.daysUntilExpiry} days remaining`}
                </div>
              )}
            </div>
          )}

          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>Created</div>
            <div style={{ fontSize: 11, color: T2 }}>
              {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${BD}`, display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '8px 12px', background: BG1,
              border: `1px solid ${BD}`, borderRadius: 4, color: TEXT,
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            }}
          >
            Close
          </button>
          <button
            style={{
              flex: 1, padding: '8px 12px', background: '#3B82F6',
              border: '1px solid #3B82F6', borderRadius: 4, color: '#F0F0F2',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            }}
          >
            Edit
          </button>
        </div>
      </div>
    </>
  )
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState({ visible: false, msg: '' })
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const showToast = useCallback((msg: string) => {
    setToast({ visible: true, msg })
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
  }, [])

  const handleSubmit = useCallback((data: SubmissionData) => {
    showToast(`Created: ${data.description || data.type} for ${data.clientName}`)
    setModalOpen(false)
    setRefreshKey(k => k + 1)
  }, [showToast])

  const handleStatusChange = useCallback((itemId: string, newStatus: string) => {
    showToast(`Status updated to "${newStatus.replace(/_/g, ' ')}"`)
    setRefreshKey(k => k + 1)
  }, [showToast])

  return (
    <>
      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: BG, fontFamily: FONT, fontSize: 13, lineHeight: 1.5,
        WebkitFontSmoothing: 'antialiased', colorScheme: 'dark',
      }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: BG }}>
          <Topbar onNewSubmission={() => setModalOpen(true)} />

          <div style={{
            flex: 1, overflowY: 'auto', padding: 18,
            display: 'flex', flexDirection: 'column', gap: 16, background: BG,
          }}>
            <MetricBar refreshKey={refreshKey} />

            <div>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 12, letterSpacing: '-0.2px' }}>
                Workflow Items
              </h2>
              <WorkflowKanban refreshKey={refreshKey} onCardClick={setSelectedItem} />
            </div>

            <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 12 }}>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>

      <NewSubmissionModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />

      <WorkflowDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onStatusChange={handleStatusChange}
      />

      <Toast message={toast.msg} visible={toast.visible} />
    </>
  )
}
