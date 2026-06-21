import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { leadId: string } }) {
  const sb = createClient()
  const { leadId } = params

  const { data: lead, error } = await sb.from('leads').select('*').eq('id', leadId).single()
  if (error || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const [steps, comms, notes] = await Promise.all([
    sb.from('lead_progress_steps').select('*').eq('lead_id', leadId).order('step_number'),
    sb.from('lead_communications').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
    sb.from('lead_notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
  ])

  return NextResponse.json({ lead, progressSteps: steps.data || [], communications: comms.data || [], notes: notes.data || [] })
}

export async function PATCH(req: NextRequest, { params }: { params: { leadId: string } }) {
  const sb = createClient()
  const { leadId } = params
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.status) updates.status = body.status
  if (body.stage) updates.stage = body.stage
  if (body.assigned_agent) updates.assigned_to = body.assigned_agent
  if (body.lead_score !== undefined) updates.lead_score = body.lead_score
  if (body.notes) updates.notes = body.notes

  const { data, error } = await sb.from('leads').update(updates).eq('id', leadId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}