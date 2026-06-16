import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') || '20'), 50)

    const activities: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      date: string;
    }> = []

    const [renewals, submissions, calls] = await Promise.all([
      supabase
        .from('renewals')
        .select('id, named_insured, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10),

      supabase
        .from('submissions')
        .select('id, tracking_number, client_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10),

      supabase
        .from('call_logs')
        .select('id, client_name, created_at, call_type, notes')
        .order('created_at', { ascending: false })
        .limit(10)
        .maybeSingle()
        .then(() => ({ data: null, error: null }))
        .catch(() => ({ data: null, error: null })),
    ])

    if (renewals.data) {
      for (const r of renewals.data) {
        activities.push({
          id: `renewal-${r.id}`,
          type: 'renewal',
          title: `Renewal: ${r.named_insured || 'Unknown'}`,
          description: `Status: ${r.status || 'pending'}`,
          date: formatDate(r.created_at),
        })
      }
    }

    if (submissions.data) {
      for (const s of submissions.data) {
        activities.push({
          id: `sub-${s.id}`,
          type: 'document',
          title: `Submission: ${s.client_name || s.tracking_number || 'New'}`,
          description: `Status: ${s.status || 'pending'}`,
          date: formatDate(s.created_at),
        })
      }
    }

    activities.sort((a, b) => b.date.localeCompare(a.date))

    return NextResponse.json({ activities: activities.slice(0, limit) })
  } catch (err) {
    console.error('Activity API error:', err)
    return NextResponse.json({ activities: [] })
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - d.getTime()) / 3600000)
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}
