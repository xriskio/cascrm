import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { leadId: string } }) {
  const sb = createClient()
  const { leadId } = params
  const { stepNumber, stepName, capturedData, moveToNextStep } = await req.json()

  const { data: lead } = await sb.from('leads').select('*').eq('id', leadId).single()
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  await sb.from('lead_progress_steps').insert({
    lead_id: leadId, step_number: stepNumber, step_name: stepName,
    captured_data: capturedData, is_completed: moveToNextStep,
    completed_at: moveToNextStep ? new Date().toISOString() : null,
  })

  const nextStep = moveToNextStep ? stepNumber + 1 : stepNumber
  const formCompletion = Math.min(Math.round((nextStep / 4) * 100), 100)
  const newStatus = moveToNextStep && stepNumber === 3 ? 'qualified' : lead.status

  const { data, error } = await sb.from('leads').update({
    form_step: nextStep, form_completion: formCompletion,
    status: newStatus, last_activity_at: new Date().toISOString(),
  }).eq('id', leadId).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}