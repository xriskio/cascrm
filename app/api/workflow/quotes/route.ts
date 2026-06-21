import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { placementId, submissionId, leadId, carrier, basePremium, taxes, fees, limits, deductibles, exclusions, carrierFinancialStrength, effectiveDate, expirationDate } = await req.json()

  const { data: sub } = await sb.from('submissions').select('estimated_annual_premium').eq('id', submissionId).single()
  const totalPremium = parseFloat(basePremium) + parseFloat(taxes || 0) + parseFloat(fees || 0)
  const prevPrem = parseFloat(sub?.estimated_annual_premium || 0)
  const delta = prevPrem > 0 ? (totalPremium - prevPrem) / prevPrem : 0
  const competitiveness = delta <= -0.1 ? 'best' : delta <= 0.05 ? 'competitive' : delta <= 0.2 ? 'moderate' : 'high'

  const year = new Date().getFullYear()
  const quoteNumber = 'QT-' + year + '-' + Math.floor(Math.random() * 9999).toString().padStart(4, '0')

  const { data: quote, error } = await sb.from('quotes').insert({
    placement_id: placementId, submission_id: submissionId, lead_id: leadId,
    quote_number: quoteNumber, carrier_name: carrier,
    base_premium: basePremium, taxes: taxes || 0, fees: fees || 0,
    annual_premium: totalPremium.toFixed(2),
    premium_percentage_delta: (delta * 100).toFixed(2), competitiveness,
    coverage_types: limits ? Object.keys(limits) : [], limits, deductibles, exclusions,
    carrier_financial_strength: carrierFinancialStrength,
    effective_date: effectiveDate, expiration_date: expirationDate,
    quote_status: 'received', status: 'received',
    quote_date_received: new Date().toISOString(),
    quote_expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('market_submissions').update({ status: 'quoted', quote_received_date: new Date().toISOString() }).eq('id', placementId)
  return NextResponse.json(quote, { status: 201 })
}