import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { workflowId: string } }) {
  const { data, error } = await supabaseAdmin.from('renewal_quotes').select('*').eq('workflow_id', params.workflowId).order('total_premium')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest, { params }: { params: { workflowId: string } }) {
  try {
    const body = await req.json()
    const { carrier, base_premium, taxes, fees, total_premium, carrier_strength, recommendation_notes } = body
    const { data: wf } = await supabaseAdmin.from('renewal_workflows').select('current_premium').eq('id', params.workflowId).single()
    const currentPremium = parseFloat(wf?.current_premium || 0)
    const totalPrem = parseFloat(total_premium || base_premium)
    const delta = currentPremium > 0 ? ((totalPrem - currentPremium) / currentPremium * 100) : null
    const comp = delta !== null ? (delta <= -10 ? 'best' : delta <= 10 ? 'competitive' : 'high') : 'received'
    const { data, error } = await supabaseAdmin.from('renewal_quotes').insert({
      workflow_id: params.workflowId, carrier, base_premium: base_premium.toString(), taxes: (taxes||0).toString(), fees: (fees||0).toString(),
      total_premium: totalPrem.toString(), premium_delta_percent: delta ? delta.toFixed(2) : null,
      carrier_strength: carrier_strength || null, recommendation_notes: recommendation_notes || null, competitiveness: comp, status: 'received'
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // Update best quote on workflow
    const { data: allQuotes } = await supabaseAdmin.from('renewal_quotes').select('total_premium').eq('workflow_id', params.workflowId)
    if (allQuotes && allQuotes.length > 0) {
      const best = Math.min(...allQuotes.map(q => parseFloat(q.total_premium)))
      await supabaseAdmin.from('renewal_workflows').update({ best_quote_premium: best.toString(), quote_count: allQuotes.length }).eq('id', params.workflowId)
    }
    await supabaseAdmin.from('renewal_activity_log').insert({ workflow_id: params.workflowId, activity_type: 'quote_received', description: 'Quote received from ' + carrier + ': $' + totalPrem.toLocaleString(), actor_role: 'agent' })
    return NextResponse.json({ success: true, quote: data }, { status: 201 })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
