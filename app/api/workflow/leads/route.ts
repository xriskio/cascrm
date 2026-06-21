import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sb = createClient()
  const body = await req.json()
  const { sessionId, email, firstName, lastName, phone, companyName, companyType, industry, policyType, source } = body

  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const { data: existing } = await sb.from('leads').select('*').eq('email', email).single()
  if (existing) {
    return NextResponse.json({ lead: existing, message: 'Lead already exists. Resuming application.', formStep: existing.form_step || 1 })
  }

  const { data: lead, error } = await sb.from('leads').insert({
    session_id: sessionId, email, contact_name: (firstName + ' ' + lastName).trim(),
    company_name: companyName, lead_type: policyType, source: source || 'web',
    status: 'new', stage: 'lead_capture', form_step: 1, form_completion: 0, lead_score: 0,
  }).select().single()

  if (error) {
    // If columns missing (SQL not run), fall back to minimal insert
    const { data: fallback, error: err2 } = await sb.from("leads").insert({
      email, contact_name: (firstName + " " + lastName).trim(),
      company_name: companyName, status: "new",
    }).select().single()
    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })
    return NextResponse.json(fallback, { status: 201 })
  }

  await sb.from('lead_progress_steps').insert({
    lead_id: lead.id, step_number: 1, step_name: 'Basic Information',
    captured_data: { firstName, lastName, email, phone, companyName, companyType, industry },
  }).select()

  return NextResponse.json(lead, { status: 201 })
}

export async function GET(req: NextRequest) {
  const sb = createClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const stage = searchParams.get('stage')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = sb.from('leads').select('*').order('created_at', { ascending: false }).limit(limit)
  if (status) query = query.eq('status', status)
  if (stage) query = query.eq('stage', stage)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data || [], count: (data || []).length })
}