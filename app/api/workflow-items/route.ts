import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { WorkflowItem } from "@/types/workflow"

export { type WorkflowItem }

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function daysUntil(date: string | null): number | undefined {
  if (!date) return undefined
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type   = searchParams.get('type')
    const limit  = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
    const sortBy = searchParams.get('sortBy') || 'expiryDate'
    const order  = searchParams.get('order')  || 'asc'

    // ── Renewals ─────────────────────────────────────────────────────────
    let rq = supabaseAdmin
      .from('renewals')
      .select('*')
      .neq('status', 'archived')
    if (status) rq = rq.eq('status', status)
    if (type === 'submission') rq = rq.limit(0)

    const { data: renewals = [], error: re } = await rq
    if (re) console.error("Renewals:", re.message)

    // ── Submissions ───────────────────────────────────────────────────────
    let sq = supabaseAdmin
      .from('submissions')
      .select('*')
      .neq('status', 'declined')
    if (status) sq = sq.eq('status', status)
    if (type === 'renewal') sq = sq.limit(0)

    const { data: submissions = [], error: se } = await sq
    if (se) console.error("Submissions:", se.message)

    // ── Transform ─────────────────────────────────────────────────────────
    const renewalItems: WorkflowItem[] = (renewals as any[]).map(r => ({
      id: r.id,
      type: 'renewal' as const,
      clientName: r.named_insured || r.client_name || '—',
      policyNumber: r.policy_number,
      status: r.status || 'pending',
      policyType: r.lob || '—',
      carrier: r.carrier || '—',
      premium: parseFloat(r.premium) || 0,
      expiryDate: r.expiration_date,
      daysUntilExpiry: daysUntil(r.expiration_date),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      assignedAgent: r.agent_name,
    }))

    const submissionItems: WorkflowItem[] = (submissions as any[]).map(s => ({
      id: s.id,
      type: 'submission' as const,
      clientName: s.client_name || '—',
      trackingNumber: s.tracking_number,
      status: s.status || 'pending',
      policyType: s.policy_type || '—',
      carrier: s.carrier || '—',
      premium: parseFloat(s.quoted_premium) || 0,
      quotedPremium: parseFloat(s.quoted_premium),
      expiryDate: s.expiration_date,
      daysUntilExpiry: daysUntil(s.expiration_date),
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      assignedAgent: s.assigned_agent,
    }))

    // ── Sort ──────────────────────────────────────────────────────────────
    let items: WorkflowItem[] = [...renewalItems, ...submissionItems]

    if (sortBy === 'expiryDate') {
      items.sort((a, b) => {
        const aD = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity
        const bD = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity
        return order === 'asc' ? aD - bD : bD - aD
      })
    } else if (sortBy === 'premium') {
      items.sort((a, b) => order === 'asc' ? a.premium - b.premium : b.premium - a.premium)
    } else {
      items.sort((a, b) => {
        const aD = new Date(a.createdAt).getTime()
        const bD = new Date(b.createdAt).getTime()
        return order === 'asc' ? aD - bD : bD - aD
      })
    }

    items = items.slice(0, limit)

    // ── Metrics ───────────────────────────────────────────────────────────
    const byStatus: Record<string, number> = {}
    items.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1 })

    const metrics = {
      total: items.length,
      byStatus,
      byType: { renewal: renewalItems.length, submission: submissionItems.length },
      overdue: items.filter(i => i.daysUntilExpiry !== undefined && i.daysUntilExpiry < 0).length,
      urgent:  items.filter(i => i.daysUntilExpiry !== undefined && i.daysUntilExpiry >= 0 && i.daysUntilExpiry <= 7).length,
    }

    return NextResponse.json({ items, metrics, pagination: { limit, returned: items.length } })
  } catch (err) {
    console.error('workflow-items error:', err)
    return NextResponse.json({ error: 'Internal server error', message: String(err) }, { status: 500 })
  }
}
