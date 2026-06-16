import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const now = new Date()
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const [renewals90, renewals30, clients, submissions] = await Promise.all([
      supabase
        .from('renewals')
        .select('*', { count: 'exact', head: true })
        .gte('expiration_date', now.toISOString().split('T')[0])
        .lte('expiration_date', in90Days.toISOString().split('T')[0])
        .neq('status', 'archived'),

      supabase
        .from('renewals')
        .select('*', { count: 'exact', head: true })
        .gte('expiration_date', now.toISOString().split('T')[0])
        .lte('expiration_date', in30Days.toISOString().split('T')[0])
        .neq('status', 'archived'),

      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '(completed,archived,bound)'),
    ])

    return NextResponse.json({
      renewals: { total: renewals90.count ?? 0, urgent: renewals30.count ?? 0 },
      clients: { total: clients.count ?? 0 },
      submissions: { total: submissions.count ?? 0 },
    })
  } catch {
    return NextResponse.json({ renewals: { total: 0, urgent: 0 }, clients: { total: 0 }, submissions: { total: 0 } })
  }
}
