import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { placementId: string } }) {
  const sb = createClient()
  const { placementId } = params
  const { newStatus, reason, carrierFeedback } = await req.json()

  const { data: placement } = await sb.from('market_submissions').select('*').eq('id', placementId).single()
  if (!placement) return NextResponse.json({ error: 'Placement not found' }, { status: 404 })

  const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() }
  if (carrierFeedback) updates.carrier_feedback = carrierFeedback
  if (newStatus === 'acknowledged') updates.acknowledged_date = new Date().toISOString()
  if (newStatus === 'quoted') updates.quote_received_date = new Date().toISOString()
  if (newStatus === 'declined') updates.decline_date = new Date().toISOString()

  const { data, error } = await sb.from('market_submissions').update(updates).eq('id', placementId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('placement_timeline').insert({
    placement_id: placementId, status_change_from: placement.status,
    status_change_to: newStatus, status_change_reason: reason,
    event_description: 'Status changed from ' + placement.status + ' to ' + newStatus,
    event_type: 'status_change', changed_by: 'agent',
  })

  return NextResponse.json(data)
}