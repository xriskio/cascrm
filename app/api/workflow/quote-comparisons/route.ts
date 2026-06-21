import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { submissionId, comparisonName, quoteIds, scoringCriteria, recommendedQuote, recommendationReason } = await req.json()

  if (!submissionId || !quoteIds?.length)
    return NextResponse.json({ error: 'submissionId and quoteIds required' }, { status: 400 })

  const { data: quotes } = await sb.from('quotes').select('*').in('id', quoteIds)
  if (!quotes?.length) return NextResponse.json({ error: 'No quotes found' }, { status: 404 })

  const sc = scoringCriteria || { premium: 0.3, coverage: 0.4, service: 0.2, strength: 0.1 }
  const minPrem = Math.min(...quotes.map(q => parseFloat(q.annual_premium) || Infinity))
  const maxPrem = Math.max(...quotes.map(q => parseFloat(q.annual_premium) || 0))
  const premRange = maxPrem - minPrem || 1

  const quoteScores: Record<string, Record<string, number>> = {}
  for (const q of quotes) {
    const prem = parseFloat(q.annual_premium) || 0
    const premScore = Math.round(((maxPrem - prem) / premRange) * 100)
    const strengthMap: Record<string, number> = { 'A++': 100, 'A+': 95, 'A': 90, 'A-': 85, 'B+': 75, 'B': 65 }
    const strengthScore = strengthMap[q.carrier_financial_strength?.split(' ')[0] || ''] || 70
    const compMap: Record<string, number> = { best: 100, competitive: 80, moderate: 55, high: 30, very_high: 10 }
    const compScore = compMap[q.competitiveness || 'moderate'] || 50
    const total = Math.round(premScore * sc.premium + compScore * sc.coverage + strengthScore * sc.service + strengthScore * sc.strength)
    quoteScores[q.id] = { premium_score: premScore, competitiveness_score: compScore, strength_score: strengthScore, total }
  }

  const bestByPremium = quotes.reduce((a, b) => (parseFloat(a.annual_premium) || Infinity) < (parseFloat(b.annual_premium) || Infinity) ? a : b)
  const bestByValue = Object.entries(quoteScores).reduce((a, b) => (b[1].total > (quoteScores[a[0]]?.total || 0) ? b : a))[0]

  const { data, error } = await sb.from('quote_comparisons').insert({
    submission_id: submissionId,
    comparison_name: comparisonName || 'Quote Comparison ' + new Date().toLocaleDateString(),
    created_by: 'agent',
    quote_ids: quoteIds,
    best_quote_by_premium: bestByPremium.id,
    best_quote_by_value: bestByValue,
    recommended_quote: recommendedQuote || bestByValue,
    recommendation_reason: recommendationReason || 'Best overall value based on premium, coverage, and carrier strength',
    scoring_criteria: sc,
    quote_scores: quoteScores,
    summary_analysis: 'Analyzed ' + quotes.length + ' quotes. Best premium: $' + Number(minPrem).toLocaleString() + ' from ' + (bestByPremium.carrier_name || bestByPremium.carrier) + '.',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
  const sb = createClient()
  const submissionId = new URL(req.url).searchParams.get('submissionId')
  let query = sb.from('quote_comparisons').select('*').order('created_at', { ascending: false })
  if (submissionId) query = query.eq('submission_id', submissionId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comparisons: data || [] })
}