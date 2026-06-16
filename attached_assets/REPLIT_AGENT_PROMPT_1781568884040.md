// PASTE THIS INTO REPLIT AGENT CHAT (copy entire block)
// This will automate the entire dashboard refactor deployment

===== START PROMPT =====

You are a Node.js/Next.js specialist. Deploy the InsureLimos CRM dashboard refactor COMPLETELY AND INDEPENDENTLY.

## TASK: Unified Workflow Kanban Dashboard Migration

Your job: Migrate the dashboard from broken 3-view layout to unified kanban without human intervention.

### CRITICAL RULES (MUST FOLLOW)
1. **NO ASSUMPTIONS**: Only execute exactly what's written below
2. **VERIFY BEFORE CHANGES**: Show file contents (grep/view) before modifying
3. **BACKUP FIRST**: Always create .backup before replacing files
4. **GIT COMMITS**: Commit after each major step (don't bundle commits)
5. **TEST LOCALLY**: Verify dev server starts, no build errors
6. **RAW ARTIFACTS ONLY**: Show grep output, curl responses, build logs, git diff --stat (never say "done" without proof)
7. **STOP ON ERROR**: If ANY step fails, show the error and STOP (don't assume/workaround)

### PHASE 1: PREPARE ENVIRONMENT (5 minutes)

**Step 1a: Verify Node.js version**
```
node --version
npm --version
```
Required: Node 18+ (show actual versions in output)

**Step 1b: Verify project structure**
```
ls -la app/
ls -la components/dashboard/
ls -la lib/
```
Must show: `app/`, `components/`, `lib/` directories exist

**Step 1c: Check for .env.local**
```
test -f .env.local && echo "✓ .env.local exists" || echo "✗ Missing .env.local - STOP"
```
If missing, STOP and ask: "Where is your Supabase connection string?"

**Step 1d: Git status check**
```
git status
```
If dirty: Ask to commit first. If clean: Proceed.

**Step 1e: Create feature branch**
```
git checkout -b dashboard-refactor-unified-kanban
git log --oneline -1
```
Show the latest commit hash to confirm branch created

---

### PHASE 2: CREATE API ENDPOINT (10 minutes)

**Step 2a: Create directory**
```
mkdir -p app/api/workflow-items
ls -la app/api/workflow-items/
```
Must show empty directory created

**Step 2b: Create route file**

```bash
cat > app/api/workflow-items/route.ts << 'ROUTE_EOF'
// File: /app/api/workflow-items/route.ts
// Purpose: Unified endpoint returning renewals + submissions as single "WorkflowItem" stream
// Deploy: Copy to app/api/workflow-items/route.ts, create directory if needed

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── TYPES ──────────────────────────────────────────────────────────────────
export interface WorkflowItem {
  id: string
  type: 'renewal' | 'submission'
  clientName: string
  policyNumber?: string
  trackingNumber?: string
  status: string
  priority?: string
  policyType: string
  carrier?: string
  premium: number
  quotedPremium?: number
  expiryDate?: string
  daysUntilExpiry?: number
  createdAt: string
  updatedAt: string
  assignedAgent?: string
}

// ── UTILITIES ──────────────────────────────────────────────────────────────
function calculateDaysUntilExpiry(expiryDate: string | null): number | undefined {
  if (!expiryDate) return undefined
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// ── GET HANDLER ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)

    // Query parameters
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'renewal' | 'submission' | 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
    const sortBy = searchParams.get('sortBy') || 'expiryDate' // expiryDate | createdAt | premium
    const order = searchParams.get('order') || 'asc'

    // Fetch renewals
    let renewalsQuery = supabase
      .from('renewals')
      .select(
        'id, policy_number, named_insured, policy_type, carrier, status, premium, expiration_date, created_at, updated_at, agent_name',
        { count: 'exact' }
      )
      .eq('archived', false)

    if (status) {
      renewalsQuery = renewalsQuery.eq('status', status)
    }
    if (type && type !== 'all') {
      if (type !== 'renewal') renewalsQuery = renewalsQuery.limit(0)
    }

    const { data: renewals = [], error: renewalError } = await renewalsQuery

    if (renewalError) {
      console.error('Renewals query error:', renewalError)
      return NextResponse.json({ error: 'Failed to fetch renewals', details: renewalError.message }, { status: 500 })
    }

    // Fetch submissions
    let submissionsQuery = supabase
      .from('submissions')
      .select(
        'id, tracking_number, client_name, policy_type, carrier, status, quoted_premium, expiration_date, created_at, updated_at, assigned_agent',
        { count: 'exact' }
      )
      .neq('status', 'declined')

    if (status) {
      submissionsQuery = submissionsQuery.eq('status', status)
    }
    if (type && type !== 'all') {
      if (type !== 'submission') submissionsQuery = submissionsQuery.limit(0)
    }

    const { data: submissions = [], error: submissionError } = await submissionsQuery

    if (submissionError) {
      console.error('Submissions query error:', submissionError)
      return NextResponse.json({ error: 'Failed to fetch submissions', details: submissionError.message }, { status: 500 })
    }

    // ── TRANSFORM ──────────────────────────────────────────────────────────
    const renewalItems: WorkflowItem[] = renewals.map((r: any) => {
      const daysUntilExpiry = calculateDaysUntilExpiry(r.expiration_date)
      return {
        id: r.id,
        type: 'renewal',
        clientName: r.named_insured || '—',
        policyNumber: r.policy_number,
        status: r.status || 'pending',
        policyType: r.policy_type || '—',
        carrier: r.carrier || '—',
        premium: parseFloat(r.premium) || 0,
        expiryDate: r.expiration_date,
        daysUntilExpiry,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        assignedAgent: r.agent_name,
      }
    })

    const submissionItems: WorkflowItem[] = submissions.map((s: any) => {
      const daysUntilExpiry = calculateDaysUntilExpiry(s.expiration_date)
      return {
        id: s.id,
        type: 'submission',
        clientName: s.client_name || '—',
        trackingNumber: s.tracking_number,
        status: s.status || 'pending',
        policyType: s.policy_type || '—',
        carrier: s.carrier || '—',
        premium: parseFloat(s.quoted_premium) || 0,
        quotedPremium: parseFloat(s.quoted_premium),
        expiryDate: s.expiration_date,
        daysUntilExpiry,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        assignedAgent: s.assigned_agent,
      }
    })

    // ── MERGE & SORT ───────────────────────────────────────────────────────
    let items = [...renewalItems, ...submissionItems]

    // Apply sorting
    if (sortBy === 'expiryDate') {
      items.sort((a, b) => {
        const aDate = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity
        const bDate = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity
        return order === 'asc' ? aDate - bDate : bDate - aDate
      })
    } else if (sortBy === 'premium') {
      items.sort((a, b) => (order === 'asc' ? a.premium - b.premium : b.premium - a.premium))
    } else if (sortBy === 'createdAt') {
      items.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime()
        const bDate = new Date(b.createdAt).getTime()
        return order === 'asc' ? aDate - bDate : bDate - aDate
      })
    }

    // Apply limit
    items = items.slice(0, limit)

    // ── COMPUTE METRICS ───────────────────────────────────────────────────
    const metrics = {
      total: items.length,
      byStatus: {} as Record<string, number>,
      byType: { renewal: renewalItems.length, submission: submissionItems.length },
      overdue: items.filter(i => i.daysUntilExpiry !== undefined && i.daysUntilExpiry < 0).length,
      urgent: items.filter(i => i.daysUntilExpiry !== undefined && i.daysUntilExpiry >= 0 && i.daysUntilExpiry <= 7).length,
    }

    items.forEach(i => {
      metrics.byStatus[i.status] = (metrics.byStatus[i.status] || 0) + 1
    })

    return NextResponse.json(
      {
        items,
        metrics,
        pagination: { limit, returned: items.length },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Workflow items error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    )
  }
}
ROUTE_EOF
```

**Step 2c: Verify file created**
```
wc -l app/api/workflow-items/route.ts
head -20 app/api/workflow-items/route.ts
```
Must show: 200+ lines, starts with "// File: /app/api/workflow-items/route.ts"

**Step 2d: Check imports exist**
```
grep -n "from.*supabase" app/api/workflow-items/route.ts
```
Must show: `import { supabaseAdmin } from "@/lib/supabase/admin"`

If import path is wrong, STOP and ask: "What's your actual supabase admin import path?"

---

### PHASE 3: CREATE COMPONENTS (15 minutes)

**Step 3a: Create WorkflowKanban.tsx**

```bash
cat > components/dashboard/WorkflowKanban.tsx << 'KANBAN_EOF'
'use client'

import { useState, useEffect } from 'react'
import type { WorkflowItem } from '@/app/api/workflow-items/route'

// ── COLORS & VARS ──────────────────────────────────────────────────────────
const BG = '#0A0A0B'
const BG1 = '#0F0F11'
const BG2 = '#141416'
const BG3 = '#1A1A1E'
const BD = 'rgba(255,255,255,0.06)'
const TEXT = '#F0F0F2'
const T2 = '#8A8A96'
const T3 = '#52525E'
const FONT = 'Inter, DM Sans, system-ui, sans-serif'

const STATUSES = [
  { id: 'pending', label: 'Pending', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.1)' },
  { id: 'in_review', label: 'In Review', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)' },
  { id: 'awaiting_uw', label: 'Awaiting UW', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.1)' },
  { id: 'bound', label: 'Bound', color: '#22C55E', bgColor: 'rgba(34,197,94,0.1)' },
]

// ── UTILITY FUNCTIONS ──────────────────────────────────────────────────────
function calculateUrgency(daysLeft?: number): {
  severity: 'overdue' | 'critical' | 'warning' | 'ok'
  color: string
  label: string
} {
  if (!daysLeft) return { severity: 'ok', color: '#22C55E', label: '—' }
  if (daysLeft < 0) return { severity: 'overdue', color: '#EF4444', label: `${Math.abs(daysLeft)}d OVERDUE` }
  if (daysLeft <= 7) return { severity: 'critical', color: '#EF4444', label: `${daysLeft}d URGENT` }
  if (daysLeft <= 14) return { severity: 'warning', color: '#F59E0B', label: `${daysLeft}d ACTION` }
  return { severity: 'ok', color: '#22C55E', label: `${daysLeft}d OK` }
}

function getStatusColor(status: string): (typeof STATUSES[0]) | undefined {
  return STATUSES.find(s => s.id === status)
}

// ── COMPONENTS ─────────────────────────────────────────────────────────────
function WorkflowCard({
  item,
  onClick,
}: {
  item: WorkflowItem
  onClick?: () => void
}) {
  const urgency = calculateUrgency(item.daysUntilExpiry)
  const icon = item.type === 'renewal' ? '🔄' : '📋'

  return (
    <div
      style={{
        background: BG2,
        border: `1px solid ${BD}`,
        borderRadius: 8,
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: FONT,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.12)'
        el.style.background = BG3
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = BD
        el.style.background = BG2
      }}
    >
      {/* Type Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.05)',
            color: T3,
            padding: '2px 5px',
            borderRadius: 3,
          }}
        >
          {item.type}
        </span>
      </div>

      {/* Client Name */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: TEXT,
          marginBottom: 4,
          lineHeight: 1.3,
          maxHeight: '2.4em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as any,
        }}
      >
        {item.clientName}
      </div>

      {/* Policy/Tracking Number */}
      <div style={{ fontSize: 9, color: T3, marginBottom: 6, fontFamily: 'monospace' }}>
        {item.policyNumber || item.trackingNumber || '—'}
      </div>

      {/* Coverage Type */}
      <div
        style={{
          fontSize: 9,
          color: T2,
          marginBottom: 6,
          textTransform: 'capitalize',
        }}
      >
        {item.policyType}
      </div>

      {/* Carrier */}
      <div
        style={{
          fontSize: 9,
          color: T3,
          marginBottom: 8,
          maxHeight: '1.2em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.carrier && item.carrier !== '—' ? item.carrier : '—'}
      </div>

      {/* Premium & Urgency Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${BD}`,
          paddingTop: 8,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: TEXT }}>
          ${item.premium.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            color: urgency.color,
            padding: '2px 5px',
            background: `${urgency.color}15`,
            borderRadius: 3,
          }}
        >
          {urgency.label}
        </span>
      </div>
    </div>
  )
}

function KanbanColumn({
  status,
  items,
  onCardClick,
}: {
  status: (typeof STATUSES[0])
  items: WorkflowItem[]
  onCardClick?: (item: WorkflowItem) => void
}) {
  return (
    <div
      style={{
        flex: '0 0 300px',
        background: BG2,
        border: `1px solid ${BD}`,
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: '12px 14px',
          background: status.bgColor,
          borderBottom: `1px solid ${BD}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: status.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: TEXT,
              textTransform: 'capitalize',
            }}
          >
            {status.label}
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            background: BG3,
            color: T3,
            padding: '2px 8px',
            borderRadius: 6,
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: '400px',
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T3,
              fontSize: 11,
              fontStyle: 'italic',
              textAlign: 'center',
              flex: 1,
              paddingY: 20,
            }}
          >
            No items
          </div>
        ) : (
          items.map((item) => (
            <WorkflowCard
              key={item.id}
              item={item}
              onClick={() => onCardClick?.(item)}
            />
          ))
        )}
      </div>

      {/* Add Card Button */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: `1px solid ${BD}`,
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          color: status.color,
          textAlign: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = status.bgColor
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = 'transparent'
        }}
      >
        + Add Item
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
interface WorkflowKanbanProps {
  onCardClick?: (item: WorkflowItem) => void
  refreshKey?: number
}

export default function WorkflowKanban({ onCardClick, refreshKey }: WorkflowKanbanProps) {
  const [items, setItems] = useState<WorkflowItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/workflow-items?limit=100&sortBy=expiryDate&order=asc')
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const data = await res.json()
        setItems(data.items || [])
      } catch (err) {
        console.error('Failed to fetch workflow items:', err)
        setError(String(err))
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [refreshKey])

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: T3,
          fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 12, marginBottom: 8 }}>Loading workflow items...</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>↻</div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          color: '#EF4444',
          fontSize: 11,
          fontFamily: FONT,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Error loading items</div>
        <div style={{ opacity: 0.8 }}>{error}</div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingRight: '20px',
        fontFamily: FONT,
      }}
    >
      {STATUSES.map((status) => {
        const columnItems = items.filter((i) => i.status === status.id)
        return (
          <KanbanColumn
            key={status.id}
            status={status}
            items={columnItems}
            onCardClick={onCardClick}
          />
        )
      })}
    </div>
  )
}
KANBAN_EOF
```

**Step 3b: Verify WorkflowKanban created**
```
wc -l components/dashboard/WorkflowKanban.tsx
grep -n "export default" components/dashboard/WorkflowKanban.tsx
```
Must show: 400+ lines, export on line ~370+

**Step 3c: Create MetricBar.tsx**

```bash
cat > components/dashboard/MetricBar.tsx << 'METRIC_EOF'
'use client'

import { useState, useEffect } from 'react'

// ── COLORS ─────────────────────────────────────────────────────────────────
const BG2 = '#141416'
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
  onStatusFilter?: (status: string | null) => void
}

function MetricBox({
  label,
  value,
  color,
  onClick,
  active,
}: {
  label: string
  value: number
  color: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 12px',
        background: active ? `${color}10` : 'transparent',
        border: `1px solid ${active ? color : BD}`,
        borderRadius: 6,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        fontFamily: FONT,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!onClick) return
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = color
        el.style.background = `${color}08`
      }}
      onMouseLeave={(e) => {
        if (!onClick) return
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = active ? color : BD
        el.style.background = active ? `${color}10` : 'transparent'
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: T3 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          fontFamily: MONO,
          letterSpacing: '-1px',
          color,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function MetricBar({ refreshKey, onStatusFilter }: MetricBarProps) {
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
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/workflow-items?limit=500')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data.metrics || {})
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [refreshKey])

  if (loading) {
    return (
      <div
        style={{
          padding: '12px 18px',
          background: BG2,
          border: `1px solid ${BD}`,
          borderRadius: 8,
          fontSize: 11,
          color: T3,
          fontFamily: FONT,
        }}
      >
        Loading metrics...
      </div>
    )
  }

  const pendingCount = metrics.byStatus['pending'] || 0
  const inReviewCount = metrics.byStatus['in_review'] || 0
  const boundCount = metrics.byStatus['bound'] || 0

  return (
    <div
      style={{
        background: BG2,
        border: `1px solid ${BD}`,
        borderRadius: 8,
        padding: '14px 16px',
        fontFamily: FONT,
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: expanded ? 12 : 0,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>Workflow Metrics</div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: T3,
            fontSize: 12,
            padding: '2px 6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = T2
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = T3
          }}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {/* Metrics Grid (conditionally rendered) */}
      {expanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: 10,
          }}
        >
          <MetricBox label="Total" value={metrics.total} color={BLUE} />
          <MetricBox label="Pending" value={pendingCount} color={AMBER} />
          <MetricBox label="In Review" value={inReviewCount} color={AMBER} />
          <MetricBox label="Bound" value={boundCount} color={GREEN} />
          <MetricBox label="Overdue" value={metrics.overdue} color={RED} />
          <MetricBox label="Urgent" value={metrics.urgent} color={RED} />
          <MetricBox label="Renewals" value={metrics.byType.renewal} color={BLUE} />
          <MetricBox label="Submissions" value={metrics.byType.submission} color={BLUE} />
        </div>
      )}

      {/* Collapsed summary line */}
      {!expanded && (
        <div
          style={{
            fontSize: 10,
            color: T2,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span>
            <strong style={{ color: TEXT }}>{metrics.total}</strong> total
          </span>
          <span>
            <strong style={{ color: RED }}>{metrics.overdue}</strong> overdue
          </span>
          <span>
            <strong style={{ color: AMBER }}>{metrics.urgent}</strong> urgent
          </span>
          <span>
            <strong style={{ color: GREEN }}>{boundCount}</strong> bound
          </span>
        </div>
      )}
    </div>
  )
}
METRIC_EOF
```

**Step 3d: Verify MetricBar created**
```
wc -l components/dashboard/MetricBar.tsx
grep -n "export default" components/dashboard/MetricBar.tsx
```
Must show: 200+ lines

---

### PHASE 4: REPLACE DASHBOARD PAGE (5 minutes)

**Step 4a: Backup existing DashboardPage**
```
cp components/dashboard/DashboardPage.tsx components/dashboard/DashboardPage.tsx.backup.pre-refactor
ls -la components/dashboard/DashboardPage.tsx*
```
Must show both original and backup

**Step 4b: Create refactored DashboardPage**

```bash
cat > components/dashboard/DashboardPage.tsx << 'DASHBOARD_EOF'
'use client'

import { useState, useCallback } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import MetricBar from '@/components/dashboard/MetricBar'
import WorkflowKanban from '@/components/dashboard/WorkflowKanban'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import NewSubmissionModal from '@/components/dashboard/NewSubmissionModal'
import type { SubmissionData } from '@/components/dashboard/NewSubmissionModal'
import type { WorkflowItem } from '@/app/api/workflow-items/route'

// ── COLORS & VARS ──────────────────────────────────────────────────────────
const BG = '#0A0A0B'
const BG1 = '#0F0F11'
const BG2 = '#141416'
const BD = 'rgba(255,255,255,0.06)'
const TEXT = '#F0F0F2'
const T2 = '#8A8A96'
const T3 = '#52525E'
const FONT = 'Inter, DM Sans, system-ui, sans-serif'
const GREEN = '#22C55E'

// ── TOAST COMPONENT ───────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#1A1A1E',
        color: TEXT,
        border: '1px solid rgba(255,255,255,0.10)',
        padding: '10px 16px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        zIndex: 400,
        fontFamily: FONT,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
      {message}
    </div>
  )
}

// ── DETAIL PANEL (Side drawer for viewing/editing workflow items) ────────────
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
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '400px',
          background: BG2,
          borderLeft: `1px solid ${BD}`,
          zIndex: 101,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: `1px solid ${BD}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
              {item.clientName}
            </div>
            <div style={{ fontSize: 10, color: T3 }}>
              {item.policyNumber || item.trackingNumber || '—'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: T2,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type & Status */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 6 }}>
              Type
            </div>
            <div style={{ fontSize: 11, color: TEXT, textTransform: 'capitalize' }}>
              {item.type === 'renewal' ? '🔄 Renewal' : '📋 Submission'}
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 6 }}>
              Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange?.(item.id, status)
                    onClose()
                  }}
                  style={{
                    padding: '8px 10px',
                    background: item.status === status ? '#3B82F6' : BG1,
                    color: item.status === status ? TEXT : T2,
                    border: `1px solid ${item.status === status ? '#3B82F6' : BD}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily: FONT,
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    if (item.status !== status) {
                      el.style.borderColor = T2
                      el.style.color = TEXT
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    if (item.status !== status) {
                      el.style.borderColor = BD
                      el.style.color = T2
                    }
                  }}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>
                Policy Type
              </div>
              <div style={{ fontSize: 11, color: T2 }}>{item.policyType}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>
                Carrier
              </div>
              <div style={{ fontSize: 11, color: T2 }}>{item.carrier || '—'}</div>
            </div>
          </div>

          {/* Premium */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>
              Premium
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
              ${item.premium.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* Expiry Info (Renewals only) */}
          {item.expiryDate && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>
                Expiry Date
              </div>
              <div style={{ fontSize: 11, color: T2 }}>
                {new Date(item.expiryDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
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

          {/* Created Date */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: T3, marginBottom: 4 }}>
              Created
            </div>
            <div style={{ fontSize: 11, color: T2 }}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px',
            borderTop: `1px solid ${BD}`,
            display: 'flex',
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: BG1,
              border: `1px solid ${BD}`,
              borderRadius: 4,
              color: TEXT,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            Close
          </button>
          <button
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#3B82F6',
              border: '1px solid #3B82F6',
              borderRadius: 4,
              color: '#F0F0F2',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT,
            }}
          >
            Edit
          </button>
        </div>
      </div>
    </>
  )
}

// ── MAIN DASHBOARD PAGE ────────────────────────────────────────────────────
export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState({ visible: false, msg: '' })
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const showToast = useCallback((msg: string) => {
    setToast({ visible: true, msg })
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 2800)
  }, [])

  const handleSubmit = useCallback(
    (data: SubmissionData) => {
      showToast(`Created: ${data.description || data.type} for ${data.clientName}`)
      setModalOpen(false)
      setRefreshKey((k) => k + 1)
    },
    [showToast]
  )

  const handleStatusChange = useCallback(
    (itemId: string, newStatus: string) => {
      showToast(`Status updated to "${newStatus}"`)
      setRefreshKey((k) => k + 1)
    },
    [showToast]
  )

  return (
    <>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          background: BG,
          fontFamily: FONT,
          fontSize: 13,
          lineHeight: 1.5,
          WebkitFontSmoothing: 'antialiased',
          colorScheme: 'dark',
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
            background: BG,
          }}
        >
          <Topbar onNewSubmission={() => setModalOpen(true)} />

          {/* Scrollable Content Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: BG,
            }}
          >
            {/* Metric Bar (Sticky) */}
            <MetricBar refreshKey={refreshKey} />

            {/* Kanban Board (Primary View) */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>
                Workflow Items
              </h2>
              <WorkflowKanban refreshKey={refreshKey} onCardClick={setSelectedItem} />
            </div>

            {/* Activity Feed (Footer) */}
            <div style={{ borderTop: `1px solid ${BD}`, paddingTop: '12px' }}>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
DASHBOARD_EOF
```

**Step 4c: Verify DashboardPage replaced**
```
wc -l components/dashboard/DashboardPage.tsx
head -5 components/dashboard/DashboardPage.tsx | grep -i "use client"
```
Must show: 400+ lines, first real line is "'use client'"

---

### PHASE 5: BUILD & TEST (10 minutes)

**Step 5a: Check TypeScript errors**
```
npm run build 2>&1 | head -50
```
If build fails, STOP and show error output.

If build succeeds:
```
npm run build 2>&1 | tail -10
```
Must show success message

**Step 5b: Start dev server**
```
npm run dev &
sleep 5
```

**Step 5c: Test API endpoint**
```
curl "http://localhost:3000/api/workflow-items?limit=5" 2>/dev/null | head -20
```
Must return JSON with `items`, `metrics`, `pagination` fields

**Step 5d: Check for errors in build output**
```
ps aux | grep "next dev"
```
Must show process running

---

### PHASE 6: GIT COMMITS (5 minutes)

**Step 6a: Commit API**
```
git add app/api/workflow-items/route.ts
git commit -m "feat: add unified workflow-items API endpoint

- Merges renewals and submissions into single stream
- Calculates daysUntilExpiry for urgency badges
- Computes metrics (total, overdue, urgent, byStatus, byType)
- Supports filtering, sorting, pagination"
git log --oneline -1
```

**Step 6b: Commit components**
```
git add components/dashboard/WorkflowKanban.tsx
git add components/dashboard/MetricBar.tsx
git commit -m "feat: add unified kanban and metrics components

- WorkflowKanban: 4-column kanban board (Pending → Bound)
- MetricBar: Sticky metrics header (collapsible)
- Smart urgency badges (red/amber/green)
- Detail panel on card click"
git log --oneline -1
```

**Step 6c: Commit dashboard replacement**
```
git add components/dashboard/DashboardPage.tsx
git add components/dashboard/DashboardPage.tsx.backup.pre-refactor
git commit -m "feat: refactor dashboard with unified workflow kanban

- Replace RenewalTable + QuotesPipeline with WorkflowKanban
- Replace StatCards with MetricBar
- Add WorkflowDetailPanel (click card → view/edit on right)
- Remove TaskPanel, AiInsightsStrip clutter
- Relocate ActivityFeed to footer"
git log --oneline -3
```

---

### PHASE 7: FINAL VERIFICATION (5 minutes)

**Step 7a: Verify all changes**
```
git status
```
Must show: "On branch dashboard-refactor-unified-kanban" and "nothing to commit"

**Step 7b: Show commit log**
```
git log --oneline -5
```

**Step 7c: Check dashboard loads**
```
curl -s "http://localhost:3000/dashboard" | head -20
```
(Should start with HTML)

**Step 7d: Verify files exist**
```
echo "=== Files created/modified ===" && \
ls -lh app/api/workflow-items/route.ts && \
ls -lh components/dashboard/WorkflowKanban.tsx && \
ls -lh components/dashboard/MetricBar.tsx && \
ls -lh components/dashboard/DashboardPage.tsx
```

---

### PHASE 8: PUSH & DEPLOY (5 minutes)

**Step 8a: Push to GitHub**
```
git push origin dashboard-refactor-unified-kanban
git branch -vv
```
Must show: Branch tracking `origin/dashboard-refactor-unified-kanban`

**Step 8b: Create PR on GitHub (or just push main)**

If you want automatic Railway deploy:
```
git checkout main
git merge dashboard-refactor-unified-kanban
git push origin main
```

**Step 8c: Verify Railway deployment started**
```
# Check Railway logs (you'll need to do this in Railway UI)
# https://railway.app → Your project → Deployments
# Watch for: "Building...", "Deploying...", "Live"
```

Wait for Railway to show **"Live"** status (usually 3-5 minutes)

---

## FINAL CHECKLIST (Before Declaring Success)

- [ ] Phase 1: Node/npm versions confirmed
- [ ] Phase 1: Project structure verified
- [ ] Phase 1: .env.local exists
- [ ] Phase 2: API route created (200+ lines)
- [ ] Phase 2: API import path correct
- [ ] Phase 3: WorkflowKanban created (400+ lines)
- [ ] Phase 3: MetricBar created (200+ lines)
- [ ] Phase 4: DashboardPage backed up
- [ ] Phase 4: DashboardPage replaced (400+ lines)
- [ ] Phase 5: npm run build succeeds (no errors)
- [ ] Phase 5: API responds to curl request
- [ ] Phase 6: 3 commits made with proper messages
- [ ] Phase 7: git status clean
- [ ] Phase 7: All files exist with correct sizes
- [ ] Phase 8: Pushed to GitHub
- [ ] Phase 8: Railway shows "Live" (wait for deploy)

---

## WHAT TO EXPECT WHEN COMPLETE

✅ Dashboard loads at http://your-domain/dashboard  
✅ Kanban board shows 4 columns (Pending, In Review, Awaiting, Bound)  
✅ MetricBar shows correct counts  
✅ Clicking a card opens detail panel on right  
✅ No console errors  
✅ Metrics auto-collapse if needed  
✅ ActivityFeed at bottom  

---

## IF SOMETHING FAILS

1. **Show error output** (git status, npm build output, curl response)
2. **Don't skip ahead** - fix the current phase before continuing
3. **Check file sizes** - if files are too small, they didn't create correctly
4. **Verify imports** - supabase admin path must match your project

===== END PROMPT =====


Now paste this entire prompt into your Replit agent chat and watch it work through all 8 phases automatically.
