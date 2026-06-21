import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'

function addDays(date: Date, days: number): Date { const d = new Date(date); d.setDate(d.getDate() + days); return d }

const TRANSITIONS: Record<string, string> = { planning: 'execution', execution: 'finalization', finalization: 'completed' }
const PROGRESS: Record<string, number> = { planning: 25, execution: 65, finalization: 95, completed: 100 }

export async function POST(req: NextRequest, { params }: { params: { workflowId: string } }) {
  try {
    const { nextPhase } = await req.json()
    const { data: wf } = await supabaseAdmin.from('renewal_workflows').select('*').eq('id', params.workflowId).single()
    if (!wf) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })

    const expected = TRANSITIONS[wf.current_phase]
    if (nextPhase && nextPhase !== expected) return NextResponse.json({ error: 'Invalid transition: ' + wf.current_phase + ' → ' + nextPhase }, { status: 400 })
    const targetPhase = nextPhase || expected

    // Mark current phase complete
    await supabaseAdmin.from('renewal_phases').update({ status: 'completed', completed_at: new Date().toISOString(), completion_percent: 100 }).eq('workflow_id', params.workflowId).eq('phase', wf.current_phase)

    // Get next phase dates
    const { data: nextPhaseRow } = await supabaseAdmin.from('renewal_phases').select('*').eq('workflow_id', params.workflowId).eq('phase', targetPhase).single()

    // Create tasks for new phase
    if (nextPhaseRow && targetPhase === 'execution') {
      await supabaseAdmin.from('renewal_tasks').insert([
        { workflow_id: params.workflowId, phase_id: nextPhaseRow.id, task_type: 'application_submission', title: 'Prepare & Submit Updated Applications', description: 'Update renewal control list and submit to underwriters.', assigned_to: wf.assigned_agent, due_date: addDays(new Date(nextPhaseRow.start_date), 5).toISOString(), priority: 'high' },
        { workflow_id: params.workflowId, phase_id: nextPhaseRow.id, task_type: 'quote_review', title: 'Review Market Conditions & Carrier Appetite', description: 'Evaluate market trends and carrier appetite.', assigned_to: wf.assigned_agent, due_date: addDays(new Date(nextPhaseRow.start_date), 15).toISOString(), priority: 'medium' }
      ])
      await supabaseAdmin.from('renewal_phases').update({ tasks_total: 2, status: 'in_progress' }).eq('id', nextPhaseRow.id)
    }
    if (nextPhaseRow && targetPhase === 'finalization') {
      await supabaseAdmin.from('renewal_tasks').insert([
        { workflow_id: params.workflowId, phase_id: nextPhaseRow.id, task_type: 'client_review', title: 'Present Final Renewal Proposal to Client', description: 'Review quotes and obtain client approval.', assigned_to: wf.assigned_agent, due_date: addDays(new Date(nextPhaseRow.start_date), 5).toISOString(), priority: 'critical', requires_client_approval: true },
        { workflow_id: params.workflowId, phase_id: nextPhaseRow.id, task_type: 'bind_policy', title: 'Bind Policy & Confirm Coverage', description: 'Process paperwork and bind with selected carrier.', assigned_to: wf.assigned_agent, due_date: addDays(new Date(nextPhaseRow.start_date), 15).toISOString(), priority: 'critical' },
        { workflow_id: params.workflowId, phase_id: nextPhaseRow.id, task_type: 'post_renewal', title: 'Post-Renewal Administration', description: 'Update COIs, set up payments, schedule debrief.', assigned_to: wf.assigned_csr || wf.assigned_agent, due_date: new Date(nextPhaseRow.end_date).toISOString(), priority: 'medium' }
      ])
      await supabaseAdmin.from('renewal_phases').update({ tasks_total: 3, status: 'in_progress' }).eq('id', nextPhaseRow.id)
    }

    const { data: updated } = await supabaseAdmin.from('renewal_workflows').update({ current_phase: targetPhase, phase_started_at: new Date().toISOString(), percent_complete: PROGRESS[targetPhase] || 0, updated_at: new Date().toISOString() }).eq('id', params.workflowId).select().single()

    await supabaseAdmin.from('renewal_activity_log').insert({ workflow_id: params.workflowId, activity_type: 'phase_changed', description: 'Phase: ' + wf.current_phase + ' → ' + targetPhase, actor_email: wf.assigned_agent, actor_role: 'agent', previous_value: { phase: wf.current_phase }, new_value: { phase: targetPhase }, visible_to_client: true })

    return NextResponse.json({ success: true, workflow: updated, message: 'Moved to ' + targetPhase + ' phase' })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
