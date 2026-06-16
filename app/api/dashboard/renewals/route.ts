import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const now = new Date()
    const in120Days = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)

    const nowStr = now.toISOString().split('T')[0]
    const endStr = in120Days.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('renewals')
      .select('id, client_name, named_insured, expiration_date, lob, policy_number, status, carrier, premium')
      .gte('expiration_date', nowStr)
      .lte('expiration_date', endStr)
      .or('status.neq.archived,status.is.null')
      .order('expiration_date', { ascending: true })
      .limit(25)

    if (error) {
      console.error('Dashboard renewals error:', error.message, { nowStr, endStr })
      return NextResponse.json({ renewals: [], debug: error.message })
    }

    const today = new Date()
    const renewals = (data || []).map(r => {
      const exp = new Date(r.expiration_date)
      const diffMs = exp.getTime() - today.getTime()
      const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return { ...r, display_name: r.named_insured || r.client_name || '—', daysUntilExpiry }
    })

    return NextResponse.json({ renewals })
  } catch {
    return NextResponse.json({ renewals: [] })
  }
}
