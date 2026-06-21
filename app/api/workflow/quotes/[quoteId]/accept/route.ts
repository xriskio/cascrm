import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: { quoteId: string } }) {
  const sb = createClient()
  const { quoteId } = params
  const { acceptedBy, authorizationEmail } = await req.json()

  const { data: quote } = await sb.from('quotes').select('*').eq('id', quoteId).single()
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  const { data: acceptance, error } = await sb.from('quote_acceptances').insert({
    quote_id: quoteId, accepted_by: acceptedBy,
    acceptance_date: new Date().toISOString(), acceptance_method: 'system',
    authorized_by_email: authorizationEmail, binding_status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('quotes').update({
    quote_status: 'accepted', is_selected_quote: true,
    client_acceptance_date: new Date().toISOString(),
  }).eq('id', quoteId)

  return NextResponse.json(acceptance)
}