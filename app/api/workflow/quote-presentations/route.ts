import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { leadId, submissionId, includedQuoteIds, recommendedQuoteId, presentationFormat } = await req.json()

  const year = new Date().getFullYear()
  const presentationNumber = 'PRES-' + year + '-' + Math.floor(Math.random() * 9999).toString().padStart(4, '0')

  const { data, error } = await sb.from('quote_presentations').insert({
    lead_id: leadId, submission_id: submissionId,
    presentation_number: presentationNumber,
    included_quote_ids: includedQuoteIds, recommended_quote_id: recommendedQuoteId,
    presentation_format: presentationFormat || 'email',
    sent_by: 'agent', presentation_date: new Date().toISOString(),
    follow_up_required: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('quotes').update({ quote_status: 'presented', presented_to_client_date: new Date().toISOString() })
    .in('id', includedQuoteIds || [])

  return NextResponse.json(data, { status: 201 })
}