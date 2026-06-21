import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { placementId: string } }) {
  const sb = createClient()
  const { data, error } = await sb.from('placement_communications')
    .select('*').eq('placement_id', params.placementId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ communications: data || [] })
}

export async function POST(req: NextRequest, { params }: { params: { placementId: string } }) {
  const sb = createClient()
  const { communicationType, direction, subject, message, attachmentCount, attachments, fromParty, toParty, fromEmail, toEmail } = await req.json()
  if (!communicationType || !direction)
    return NextResponse.json({ error: 'communicationType and direction required' }, { status: 400 })

  const { data, error } = await sb.from('placement_communications').insert({
    placement_id: params.placementId,
    communication_type: communicationType,
    direction,
    subject,
    message,
    from_party: fromParty || (direction === 'outbound' ? 'agent' : 'carrier'),
    to_party: toParty || (direction === 'inbound' ? 'agent' : 'carrier'),
    from_email: fromEmail,
    to_email: toEmail,
    attachment_count: attachmentCount || 0,
    attachments: attachments || null,
    sent_at: new Date().toISOString(),
    recorded_by: 'agent',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}