import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const PHASE_PROGRESS: Record<string, number> = { planning: 25, execution: 65, finalization: 95, completed: 100 }

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const { policyNumber, policyType, expirationDate, assignedAgent, assignedCSR, clientId, policyId, currentCarrier, currentPremium, notes } = b
    if (!policyNumber || !expirationDate || !assignedAgent) return NextResponse.json({ error: 'policyNumber, expirationDate, assignedAgent required' }, { status: 400 })

    const exp = new Date(expirationDate)
    const renewalStart = addDays(exp, -120)

    const { data: wf, error: we } = await supabaseAdmin.from('renewal_workflows').insert({
      policy_number: policyNumber, policy_type: policyType || 'GL', expiration_date: exp.toISOString(),
      renewal_start_date: renewalStart.toISOString(), assigned_agent: assignedAgent, assigned_csr: assignedCSR || null,
      client_id: clientId || null, policy_id: policyId || null, current_carrier: currentCarrier || null,
      current_premium: currentPremium || null, notes: notes || null, current_phase: 'planning', status: 'pending', percent_complete: 0
    }).select().single()
    if (we || !wf) return NextResponse.json({ error: we?.message || 'Failed to create workflow' }, { status: 500 })

    // Create 3 phases
    const planningEnd = addDays(renewalStart, 30)
    const execStart = addDays(planningEnd, 1)
    const execEnd = addDays(renewalStart, 75)
    const finalStart = addDays(execEnd, 1)
    const { data: phases } = await supabaseAdmin.from('renewal_phases').insert([
      { workflow_id: wf.id, phase: 'planning', start_date: renewalStart.toISOString(), end_date: planningEnd.toISOString(), status: 'in_progress' },
      { workflow_id: wf.id, phase: 'execution', start_date: execStart.toISOString(), end_date: execEnd.toISOString(), status: 'pending' },
      { workflow_id: wf.id, phase: 'finalization', start_date: finalStart.toISOString(), end_date: exp.toISOString(), status: 'pending' }
    ]).select()

    // Auto-create planning tasks
    if (phases) {
      const planPhase = phases.find(p => p.phase === 'planning')
      if (planPhase) {
        await supabaseAdmin.from('renewal_tasks').insert([
          { workflow_id: wf.id, phase_id: planPhase.id, task_type: 'strategy_meeting', title: 'Schedule Strategy Meeting with Client', description: 'Discuss business changes, claims history, and risk management.', assigned_to: assignedAgent, due_date: addDays(renewalStart, 5).toISOString(), priority: 'high', requires_client_approval: true },
          { workflow_id: wf.id, phase_id: planPhase.id, task_type: 'data_gathering', title: 'Gather Updated Business Data', description: 'Collect financial reports, payroll numbers, asset lists.', assigned_to: assignedCSR || assignedAgent, due_date: addDays(renewalStart, 15).toISOString(), priority: 'high' },
          { workflow_id: wf.id, phase_id: planPhase.id, task_type: 'coverage_review', title: 'Identify Coverage Changes & Limits', description: 'Assess if higher limits or new endorsements are needed.', assigned_to: assignedAgent, due_date: addDays(renewalStart, 20).toISOString(), priority: 'medium' }
        ])
        await supabaseAdmin.from('renewal_phases').update({ tasks_total: 3 }).eq('id', planPhase.id)
      }
    }

    await supabaseAdmin.from('renewal_activity_log').insert({ workflow_id: wf.id, activity_type: 'workflow_created', description: 'Renewal workflow created. Phase: Planning (120 days out)', actor_email: assignedAgent, actor_role: 'agent' })
    return NextResponse.json({ success: true, workflow: wf, phases, message: 'Renewal workflow created with 3 phases and planning tasks' }, { status: 201 })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function GET(req: NextRequest) {
  try {
    const s = new URL(req.url).searchParams
    const phase = s.get('phase'), status = s.get('status'), limit = parseInt(s.get('limit') || '50')
    let q = supabaseAdmin.from('renewal_workflows').select('*').order('expiration_date', { ascending: true }).limit(limit)
    if (phase) q = q.eq('current_phase', phase)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw error
    return NextResponse.json(data || [])
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
