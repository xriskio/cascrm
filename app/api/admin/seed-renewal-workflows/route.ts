import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()+n); return r }

// Seed workflows from REAL renewals in the database
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized — set x-admin-secret header' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const limit = body.limit || 5

  // 1. Get real renewals that don't have workflows yet
  const { data: renewals } = await supabaseAdmin
    .from('renewals')
    .select('id,policy_number,lob,expiration_date,carrier,premium,agent_name,client_name,named_insured')
    .not('expiration_date', 'is', null)
    .order('expiration_date', { ascending: true })
    .limit(limit)

  if (!renewals || renewals.length === 0) {
    return NextResponse.json({ error: 'No renewals found to seed workflows for', hint: 'Import renewals first via /renewals/import or QQCatalyst sync' }, { status: 404 })
  }

  const results = []
  let created = 0, skipped = 0

  for (const renewal of renewals) {
    // Check if workflow already exists for this policy
    const { data: existing } = await supabaseAdmin.from('renewal_workflows').select('id').eq('policy_number', renewal.policy_number).maybeSingle()
    if (existing) { skipped++; continue }

    const exp = new Date(renewal.expiration_date)
    const renewalStart = addDays(exp, -120)
    const agent = renewal.agent_name || 'wael@casurance.com'

    // Create workflow
    const { data: wf, error: we } = await supabaseAdmin.from('renewal_workflows').insert({
      policy_number: renewal.policy_number,
      policy_type: renewal.lob || 'GL',
      expiration_date: exp.toISOString(),
      renewal_start_date: renewalStart.toISOString(),
      assigned_agent: agent,
      current_carrier: renewal.carrier || null,
      current_premium: renewal.premium ? renewal.premium.toString() : null,
      status: 'pending',
      current_phase: 'planning',
      percent_complete: 0,
    }).select().single()

    if (we || !wf) { results.push({ policy: renewal.policy_number, error: we?.message }); continue }

    // Create 3 phases
    const planningEnd = addDays(renewalStart, 30)
    const execStart = addDays(planningEnd, 1)
    const execEnd = addDays(renewalStart, 75)
    const finalStart = addDays(execEnd, 1)

    const { data: phases } = await supabaseAdmin.from('renewal_phases').insert([
      { workflow_id: wf.id, phase: 'planning', start_date: renewalStart.toISOString(), end_date: planningEnd.toISOString(), status: 'in_progress', tasks_total: 3 },
      { workflow_id: wf.id, phase: 'execution', start_date: execStart.toISOString(), end_date: execEnd.toISOString(), status: 'pending', tasks_total: 0 },
      { workflow_id: wf.id, phase: 'finalization', start_date: finalStart.toISOString(), end_date: exp.toISOString(), status: 'pending', tasks_total: 0 }
    ]).select()

    // Create planning tasks
    const planPhase = phases?.find(p => p.phase === 'planning')
    if (planPhase) {
      await supabaseAdmin.from('renewal_tasks').insert([
        { workflow_id: wf.id, phase_id: planPhase.id, task_type: 'strategy_meeting', title: 'Schedule Strategy Meeting with Client', description: 'Review business changes, claims history, and risk management for ' + (renewal.named_insured||renewal.client_name||renewal.policy_number), assigned_to: agent, due_date: addDays(renewalStart, 5).toISOString(), priority: 'high', requires_client_approval: true },
        { workflow_id: wf.id, phase_id: planPhase.id, task_type: 'data_gathering', title: 'Gather Updated Business Data', description: 'Collect financial reports, payroll, and asset lists', assigned_to: agent, due_date: addDays(renewalStart, 15).toISOString(), priority: 'high' },
        { workflow_id: wf.id, phase_id: planPhase.id, task_type: 'coverage_review', title: 'Review Coverage Needs and Limits', description: 'Assess if higher limits or endorsements are needed', assigned_to: agent, due_date: addDays(renewalStart, 20).toISOString(), priority: 'medium' }
      ])
    }

    // Log creation
    await supabaseAdmin.from('renewal_activity_log').insert({ workflow_id: wf.id, activity_type: 'workflow_created', description: 'Renewal workflow seeded from existing renewal data. Phase: Planning', actor_role: 'system' })

    created++
    results.push({ policy: renewal.policy_number, client: renewal.named_insured||renewal.client_name, workflowId: wf.id, carrier: renewal.carrier, premium: renewal.premium, expires: renewal.expiration_date, status: 'created' })
  }

  return NextResponse.json({
    success: true,
    message: 'Seeded ' + created + ' renewal workflows from your existing renewals data',
    created,
    skipped,
    results,
    nextSteps: [
      'Visit /renewals/workflows to see all workflows',
      'Click any renewal detail → Begin Renewal Process to see the workflow UI',
      'Add carrier quotes in the Execution phase to compare prices',
      'Bind the best quote in Finalization'
    ]
  })
}

// GET — check seeding status
export async function GET() {
  const { count: renewalCount } = await supabaseAdmin.from('renewals').select('*', { count: 'exact', head: true })
  const { count: workflowCount } = await supabaseAdmin.from('renewal_workflows').select('*', { count: 'exact', head: true }).throwOnError().catch(() => ({ count: 0 }))
  const { data: latestWorkflows } = await supabaseAdmin.from('renewal_workflows').select('policy_number,status,current_phase,percent_complete,expiration_date').order('created_at', { ascending: false }).limit(5).catch(() => ({ data: [] }))
  return NextResponse.json({
    renewalsInDatabase: renewalCount || 0,
    workflowsCreated: workflowCount || 0,
    latestWorkflows: latestWorkflows || [],
    seedInstruction: 'POST /api/admin/seed-renewal-workflows with header x-admin-secret: YOUR_CRON_SECRET',
    hint: workflowCount === 0 ? 'No workflows yet. Run the seed to create workflows from your existing renewals.' : 'Workflows exist. Visit /renewals/workflows to manage them.'
  })
}
