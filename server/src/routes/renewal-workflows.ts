import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { sendRenewalNotification } from '../lib/email.js'

const router = Router()

const DEFAULT_TASKS = [
  { phase: 'planning', title: 'Schedule strategy meeting with client', description: 'Discuss business changes, claims history, and risk management initiatives', assigned_role: 'agent', sort_order: 1 },
  { phase: 'planning', title: 'Request updated financial reports', description: 'Obtain current financials, revenue projections, and balance sheet', assigned_role: 'csr', sort_order: 2 },
  { phase: 'planning', title: 'Collect updated payroll figures', description: 'Required for Workers Comp and General Liability calculations', assigned_role: 'csr', sort_order: 3 },
  { phase: 'planning', title: 'Update asset inventory', description: 'Current list of equipment, vehicles, real estate locations, and values', assigned_role: 'csr', sort_order: 4 },
  { phase: 'planning', title: 'Review claims history (3–5 years)', description: 'Pull loss runs and evaluate claims trends with client', assigned_role: 'agent', sort_order: 5 },
  { phase: 'planning', title: 'Identify coverage changes needed', description: 'Higher limits, new endorsements, or coverages to eliminate', assigned_role: 'agent', sort_order: 6 },
  { phase: 'planning', title: 'Send 120-day kickoff notification to client', description: 'Automated renewal kickoff email via Resend', assigned_role: 'csr', sort_order: 7 },
  { phase: 'execution', title: 'Update renewal control list', description: 'Ensure all account details are current in CRM before submission', assigned_role: 'account_manager', sort_order: 1 },
  { phase: 'execution', title: 'Prepare and submit renewal applications', description: 'Complete comprehensive applications for all lines to underwriters', assigned_role: 'account_manager', sort_order: 2 },
  { phase: 'execution', title: 'Send market submission notification to client', description: 'Inform client applications have been submitted (90-day update)', assigned_role: 'csr', sort_order: 3 },
  { phase: 'execution', title: 'Review current market conditions', description: 'Evaluate inflation, carrier appetite, and market hardening/softening', assigned_role: 'agent', sort_order: 4 },
  { phase: 'execution', title: 'Follow up with carriers on outstanding quotes', description: 'Chase quotes and document carrier responses', assigned_role: 'account_manager', sort_order: 5 },
  { phase: 'execution', title: 'Evaluate quotes received', description: 'Analyze carrier financials, exclusions, and total cost of risk — not just premium', assigned_role: 'agent', sort_order: 6 },
  { phase: 'execution', title: 'Notify client when quotes are ready', description: 'Send quote summary email to client for initial review', assigned_role: 'csr', sort_order: 7 },
  { phase: 'finalization', title: 'Prepare final renewal proposal', description: 'Comprehensive proposal with recommended options and analysis', assigned_role: 'agent', sort_order: 1 },
  { phase: 'finalization', title: 'Present proposal to client (30 days out)', description: 'Formal presentation of renewal options — must occur by 30 days prior to expiration', assigned_role: 'agent', sort_order: 2 },
  { phase: 'finalization', title: 'Send 30-day action required notification', description: 'Email client with urgent proposal review request', assigned_role: 'csr', sort_order: 3 },
  { phase: 'finalization', title: 'Obtain client approval to bind', description: 'Get written authorization from client for selected coverage and terms', assigned_role: 'agent', sort_order: 4 },
  { phase: 'finalization', title: 'Bind the policy', description: 'Confirm coverage in writing with carrier and issue binder', assigned_role: 'account_manager', sort_order: 5 },
  { phase: 'finalization', title: 'Send bound confirmation to client', description: 'Email confirmation that coverage is secured', assigned_role: 'csr', sort_order: 6 },
  { phase: 'post_renewal', title: 'Issue updated certificates of insurance', description: 'Update COIs for all lenders, landlords, and contract partners', assigned_role: 'csr', sort_order: 1 },
  { phase: 'post_renewal', title: 'Set up payment plan', description: 'Configure pay-as-you-go, monthly installments, or direct bill as preferred', assigned_role: 'csr', sort_order: 2 },
  { phase: 'post_renewal', title: 'Schedule post-renewal debrief', description: 'Review final coverage changes and plan for next cycle', assigned_role: 'agent', sort_order: 3 },
  { phase: 'post_renewal', title: 'Send post-renewal debrief email', description: 'Email client to schedule debrief meeting', assigned_role: 'csr', sort_order: 4 },
  { phase: 'post_renewal', title: 'Set next renewal cycle reminder (120 days)', description: 'Configure CRM reminder for upcoming renewal cycle start', assigned_role: 'account_manager', sort_order: 5 },
]

// GET /api/renewal-workflows
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || '1')
    const limit = parseInt(req.query.limit as string || '20')
    const offset = (page - 1) * limit
    const { phase, status, search } = req.query

    let query = supabaseAdmin.from('renewal_workflows').select('*', { count: 'exact' })
    if (phase && phase !== 'all') query = query.eq('current_phase', phase as string)
    if (status && status !== 'all') query = query.eq('status', status as string)
    if (search) query = query.or(`named_insured.ilike.%${search}%,policy_number.ilike.%${search}%,policy_type.ilike.%${search}%`)

    const { data, error, count } = await query.order('expiration_date', { ascending: true }).range(offset, offset + limit - 1)
    if (error) return res.status(500).json({ error: error.message })

    const now = new Date()
    const enriched = (data || []).map((wf) => ({
      ...wf,
      days_to_expiry: wf.expiration_date
        ? Math.ceil((new Date(wf.expiration_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }))

    res.json({ data: enriched, total: count, page, limit })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/renewal-workflows
router.post('/', async (req, res) => {
  try {
    const { renewal_id, policy_number, named_insured, policy_type, expiration_date,
      client_email, client_phone, agent_name, agent_email, expiring_premium } = req.body

    if (!renewal_id || !expiration_date) {
      return res.status(400).json({ error: 'renewal_id and expiration_date are required' })
    }

    const { data: existing } = await supabaseAdmin.from('renewal_workflows').select('id').eq('renewal_id', renewal_id).single()
    if (existing) return res.status(409).json({ error: 'Workflow already exists for this renewal', workflowId: existing.id })

    const { data: workflow, error: wfError } = await supabaseAdmin
      .from('renewal_workflows')
      .insert({ renewal_id, policy_number, named_insured, policy_type, expiration_date,
        client_email, client_phone, agent_name, agent_email, expiring_premium, current_phase: 'planning', status: 'active' })
      .select().single()

    if (wfError) return res.status(500).json({ error: wfError.message })

    const expDate = new Date(expiration_date)
    const phaseDueDates: Record<string, Date> = {
      planning: new Date(expDate.getTime() - 90 * 86400000),
      execution: new Date(expDate.getTime() - 45 * 86400000),
      finalization: new Date(expDate.getTime()),
      post_renewal: new Date(expDate.getTime() + 14 * 86400000),
    }

    const tasks = DEFAULT_TASKS.map((t) => ({
      ...t, workflow_id: workflow.id, status: 'pending', due_date: phaseDueDates[t.phase],
    }))

    const { error: tasksError } = await supabaseAdmin.from('renewal_workflow_tasks').insert(tasks)
    if (tasksError) console.error('Failed to seed tasks:', tasksError)

    res.status(201).json({ data: workflow })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/renewal-workflows/:workflowId
router.get('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params
    const { data: workflow, error } = await supabaseAdmin.from('renewal_workflows').select('*').eq('id', workflowId).single()
    if (error || !workflow) return res.status(404).json({ error: 'Workflow not found' })

    const [{ data: tasks }, { data: notifications }] = await Promise.all([
      supabaseAdmin.from('renewal_workflow_tasks').select('*').eq('workflow_id', workflowId).order('phase').order('sort_order'),
      supabaseAdmin.from('renewal_workflow_notifications').select('*').eq('workflow_id', workflowId).order('sent_at', { ascending: false }),
    ])

    const now = new Date()
    const daysToExpiry = workflow.expiration_date
      ? Math.ceil((new Date(workflow.expiration_date).getTime() - now.getTime()) / 86400000)
      : null

    const phases = ['planning', 'execution', 'finalization', 'post_renewal']
    const tasksByPhase = phases.reduce((acc: Record<string, any[]>, phase) => {
      acc[phase] = (tasks || []).filter((t) => t.phase === phase)
      return acc
    }, {})

    const phaseProgress = phases.reduce((acc: Record<string, number>, phase) => {
      const pt = (tasks || []).filter((t) => t.phase === phase)
      const done = pt.filter((t) => t.status === 'completed' || t.status === 'skipped').length
      acc[phase] = pt.length > 0 ? Math.round((done / pt.length) * 100) : 0
      return acc
    }, {})

    res.json({ data: { ...workflow, days_to_expiry: daysToExpiry }, tasks, tasksByPhase, phaseProgress, notifications: notifications || [] })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/renewal-workflows/:workflowId
router.patch('/:workflowId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('renewal_workflows')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.workflowId)
      .select().single()

    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/renewal-workflows/:workflowId/tasks
router.get('/:workflowId/tasks', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('renewal_workflow_tasks').select('*').eq('workflow_id', req.params.workflowId).order('phase').order('sort_order')
  if (error) return res.status(500).json({ error: error.message })
  res.json({ data })
})

// POST /api/renewal-workflows/:workflowId/tasks
router.post('/:workflowId/tasks', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('renewal_workflow_tasks')
    .insert({ ...req.body, workflow_id: req.params.workflowId, is_default: false, status: 'pending' })
    .select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ data })
})

// PATCH /api/renewal-workflows/:workflowId/tasks/:taskId
router.patch('/:workflowId/tasks/:taskId', async (req, res) => {
  try {
    const { workflowId, taskId } = req.params
    const update: Record<string, unknown> = { ...req.body, updated_at: new Date().toISOString() }
    if (req.body.status === 'completed' && !req.body.completed_at) update.completed_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('renewal_workflow_tasks').update(update).eq('id', taskId).eq('workflow_id', workflowId).select().single()
    if (error) return res.status(500).json({ error: error.message })

    // Auto-advance phase
    const { data: allTasks } = await supabaseAdmin.from('renewal_workflow_tasks').select('phase, status').eq('workflow_id', workflowId)
    const { data: workflow } = await supabaseAdmin.from('renewal_workflows').select('current_phase').eq('id', workflowId).single()

    if (allTasks && workflow) {
      const phases = ['planning', 'execution', 'finalization', 'post_renewal']
      const currentIdx = phases.indexOf(workflow.current_phase)
      const currentPhaseTasks = allTasks.filter((t) => t.phase === workflow.current_phase)
      const allCurrentDone = currentPhaseTasks.every((t) => t.status === 'completed' || t.status === 'skipped')

      if (allCurrentDone && currentIdx < phases.length - 1) {
        await supabaseAdmin.from('renewal_workflows')
          .update({ current_phase: phases[currentIdx + 1], updated_at: new Date().toISOString() }).eq('id', workflowId)
      }

      const allDone = allTasks.every((t) => t.status === 'completed' || t.status === 'skipped')
      if (allDone) {
        await supabaseAdmin.from('renewal_workflows')
          .update({ current_phase: 'complete', status: 'bound', updated_at: new Date().toISOString() }).eq('id', workflowId)
      }
    }

    res.json({ data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/renewal-workflows/:workflowId/tasks/:taskId
router.delete('/:workflowId/tasks/:taskId', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('renewal_workflow_tasks').delete().eq('id', req.params.taskId).eq('workflow_id', req.params.workflowId)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// POST /api/renewal-workflows/:workflowId/notify
router.post('/:workflowId/notify', async (req, res) => {
  try {
    const { workflowId } = req.params
    const { notification_type, custom_message } = req.body

    const { data: workflow, error: wfError } = await supabaseAdmin.from('renewal_workflows').select('*').eq('id', workflowId).single()
    if (wfError || !workflow) return res.status(404).json({ error: 'Workflow not found' })
    if (!workflow.client_email) return res.status(400).json({ error: 'No client email on file' })

    const result = await sendRenewalNotification({
      workflowId,
      notificationType: notification_type,
      clientName: workflow.named_insured || 'Valued Client',
      clientEmail: workflow.client_email,
      agentName: workflow.agent_name,
      agentEmail: workflow.agent_email,
      policyType: workflow.policy_type || 'Commercial Insurance',
      policyNumber: workflow.policy_number,
      expirationDate: workflow.expiration_date,
      expiringPremium: workflow.expiring_premium ? parseFloat(workflow.expiring_premium) : undefined,
      quotedPremium: workflow.quoted_premium ? parseFloat(workflow.quoted_premium) : undefined,
      boundPremium: workflow.bound_premium ? parseFloat(workflow.bound_premium) : undefined,
      customMessage: custom_message,
    })

    await supabaseAdmin.from('renewal_workflow_notifications').insert({
      workflow_id: workflowId, notification_type,
      recipient_email: workflow.client_email, recipient_name: workflow.named_insured,
      recipient_type: 'client', subject: `${notification_type} notification`,
      body_preview: custom_message || null,
      status: result.success ? 'sent' : 'failed',
      resend_id: result.emailId || null, error_message: result.error || null,
      sent_at: new Date().toISOString(),
    })

    if (!result.success) return res.status(500).json({ error: result.error })
    res.json({ success: true, emailId: result.emailId })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/renewal-workflows/:workflowId/notify
router.get('/:workflowId/notify', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('renewal_workflow_notifications').select('*').eq('workflow_id', req.params.workflowId).order('sent_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ data })
})

export default router
