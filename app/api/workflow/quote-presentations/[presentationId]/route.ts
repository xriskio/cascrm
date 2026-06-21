import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { presentationId: string } }) {
  const sb = createClient()
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  if (body.clientReaction) updates.client_reaction = body.clientReaction
  if (body.clientPreferredQuoteId) updates.client_preferred_quote_id = body.clientPreferredQuoteId
  if (body.followUpRequired !== undefined) updates.follow_up_required = body.followUpRequired
  if (body.followUpDate) updates.follow_up_date = body.followUpDate
  if (body.clientReaction) updates.client_reaction_date = new Date().toISOString()

  const { data, error } = await sb.from('quote_presentations')
    .update(updates).eq('id', params.presentationId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(_req: NextRequest, { params }: { params: { presentationId: string } }) {
  const sb = createClient()
  const { data, error } = await sb.from('quote_presentations')
    .select('*').eq('id', params.presentationId).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}