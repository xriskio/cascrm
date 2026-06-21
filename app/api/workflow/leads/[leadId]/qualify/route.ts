import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: { leadId: string } }) {
  const sb = createClient()
  const { leadId } = params
  const { qualificationReason, assignedAgent, leadScore } = await req.json()

  const { data: lead } = await sb.from('leads').select('*').eq('id', leadId).single()
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const { data, error } = await sb.from('leads').update({
    status: 'qualified', stage: 'submission_prep',
    qualification_reason: qualificationReason,
    assigned_to: assignedAgent, lead_score: leadScore || 75,
    assigned_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', leadId).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('lead_notes').insert({
    lead_id: leadId,
    content: 'Lead qualified. Reason: ' + qualificationReason,
    note_type: 'qualified', created_by: assignedAgent || 'system',
  })

  return NextResponse.json(data)
}