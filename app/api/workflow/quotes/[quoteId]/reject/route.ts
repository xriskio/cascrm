import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: { quoteId: string } }) {
  const sb = createClient()
  const { rejectionReason, rejectionCategory, detailedFeedback, alternativePreferences } = await req.json()

  if (!rejectionReason)
    return NextResponse.json({ error: 'rejectionReason is required' }, { status: 400 })

  const { data: quote } = await sb.from('quotes').select('*').eq('id', params.quoteId).single()
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  const { data: rejection, error } = await sb.from('quote_rejections').insert({
    quote_id: params.quoteId,
    rejected_by: 'client',
    rejection_reason: rejectionReason,
    rejection_category: rejectionCategory || 'other',
    detailed_feedback: detailedFeedback,
    alternative_preferences: alternativePreferences || null,
    rejection_date: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('quotes').update({
    quote_status: 'declined',
    updated_at: new Date().toISOString(),
  }).eq('id', params.quoteId)

  return NextResponse.json(rejection, { status: 201 })
}