import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: { quoteId: string } }) {
  const sb = createClient()
  const { quoteId } = params
  const { policyNumber, bindingConfirmationNumber, policyDocumentUrl } = await req.json()

  const { data, error } = await sb.from('quotes').update({
    policy_number: policyNumber, quote_status: 'bound',
    bound_date: new Date().toISOString(), policy_issuance_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', quoteId).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('quote_acceptances').update({
    binding_status: 'bound', binding_date: new Date().toISOString(),
    binding_confirmation_number: bindingConfirmationNumber,
    policy_document_url: policyDocumentUrl,
  }).eq('quote_id', quoteId)

  const { data: quote } = await sb.from('quotes').select('submission_id').eq('id', quoteId).single()
  if (quote?.submission_id) {
    await sb.from('submissions').update({ status: 'accepted' }).eq('id', quote.submission_id)
  }

  return NextResponse.json(data)
}