import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Default 120-day workflow tasks seeded on workflow creation
const DEFAULT_TASKS = [
  // Phase 1: Planning (120-90 days)
  { phase: 'planning', title: 'Schedule strategy meeting with client', description: 'Discuss business changes, claims history, and risk management initiatives', assigned_role: 'agent', sort_order: 1 },
  { phase: 'planning', title: 'Request updated financial reports', description: 'Obtain current financials, revenue projections, and balance sheet', assigned_role: 'csr', sort_order: 2 },
  { phase: 'planning', title: 'Collect updated payroll figures', description: 'Required for Workers Comp and General Liability calculations', assigned_role: 'csr', sort_order: 3 },
  { phase: 'planning', title: 'Update asset inventory', description: 'Current list of equipment, vehicles, real estate locations, and values', assigned_role: 'csr', sort_order: 4 },
  { phase: 'planning', title: 'Review claims history (3–5 years)', description: 'Pull loss runs and evaluate claims trends with client', assigned_role: 'agent', sort_order: 5 },
  { phase: 'planning', title: 'Identify coverage changes needed', description: 'Higher limits, new endorsements, or coverages to eliminate', assigned_role: 'agent', sort_order: 6 },
  { phase: 'planning', title: 'Send 120-day kickoff notification to client', description: 'Automated renewal kickoff email via Resend', assigned_role: 'csr', sort_order: 7 },

  // Phase 2: Execution (90-45 days)
  { phase: 'execution', title: 'Update renewal control list', description: 'Ensure all account details are current in CRM before submission', assigned_role: 'account_manager', sort_order: 1 },
  { phase: 'execution', title: 'Prepare and submit renewal applications', description: 'Complete comprehensive applications for all lines to underwriters', assigned_role: 'account_manager', sort_order: 2 },
  { phase: 'execution', title: 'Send market submission notification to client', description: 'Inform client applications have been submitted (90-day update)', assigned_role: 'csr', sort_order: 3 },
  { phase: 'execution', title: 'Review current market conditions', description: 'Evaluate inflation, carrier appetite, and market hardening/softening', assigned_role: 'agent', sort_order: 4 },
  { phase: 'execution', title: 'Follow up with carriers on outstanding quotes', description: 'Chase quotes and document carrier responses', assigned_role: 'account_manager', sort_order: 5 },
  { phase: 'execution', title: 'Evaluate quotes received', description: 'Analyze carrier financials, exclusions, and total cost of risk — not just premium', assigned_role: 'agent', sort_order: 6 },
  { phase: 'execution', title: 'Notify client when quotes are ready', description: 'Send quote summary email to client for initial review', assigned_role: 'csr', sort_order: 7 },

  // Phase 3: Finalization (45-0 days)
  { phase: 'finalization', title: 'Prepare final renewal proposal', description: 'Comprehensive proposal with recommended options and analysis', assigned_role: 'agent', sort_order: 1 },
  { phase: 'finalization', title: 'Present proposal to client (30 days out)', description: 'Formal presentation of renewal options — must occur by 30 days prior to expiration', assigned_role: 'agent', sort_order: 2 },
  { phase: 'finalization', title: 'Send 30-day action required notification', description: 'Email client with urgent proposal review request', assigned_role: 'csr', sort_order: 3 },
  { phase: 'finalization', title: 'Obtain client approval to bind', description: 'Get written authorization from client for selected coverage and terms', assigned_role: 'agent', sort_order: 4 },
  { phase: 'finalization', title: 'Bind the policy', description: 'Confirm coverage in writing with carrier and issue binder', assigned_role: 'account_manager', sort_order: 5 },
  { phase: 'finalization', title: 'Send bound confirmation to client', description: 'Email confirmation that coverage is secured', assigned_role: 'csr', sort_order: 6 },

  // Post-renewal
  { phase: 'post_renewal', title: 'Issue updated certificates of insurance', description: 'Update COIs for all lenders, landlords, and contract partners', assigned_role: 'csr', sort_order: 1 },
  { phase: 'post_renewal', title: 'Set up payment plan', description: 'Configure pay-as-you-go, monthly installments, or direct bill as preferred', assigned_role: 'csr', sort_order: 2 },
  { phase: 'post_renewal', title: 'Schedule post-renewal debrief', description: 'Review final coverage changes and plan for next cycle', assigned_role: 'agent', sort_order: 3 },
  { phase: 'post_renewal', title: 'Send post-renewal debrief email', description: 'Email client to schedule debrief meeting', assigned_role: 'csr', sort_order: 4 },
  { phase: 'post_renewal', title: 'Set next renewal cycle reminder (120 days)', description: 'Configure CRM reminder for upcoming renewal cycle start', assigned_role: 'account_manager', sort_order: 5 },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const phase = searchParams.get('phase')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('renewal_workflows')
      .select('*', { count: 'exact' })

    if (phase && phase !== 'all') query = query.eq('current_phase', phase)
    if (status && status !== 'all') query = query.eq('status', status)
    if (search) query = query.or(`named_insured.ilike.%${search}%,policy_number.ilike.%${search}%,policy_type.ilike.%${search}%`)

    const { data, error, count } = await query
      .order('expiration_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Calculate days to expiry for each workflow
    const now = new Date()
    const enriched = (data || []).map((wf) => ({
      ...wf,
      days_to_expiry: wf.expiration_date
        ? Math.ceil((new Date(wf.expiration_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }))

    return NextResponse.json({ data: enriched, total: count, page, limit })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()

    const {
      renewal_id,
      policy_number,
      named_insured,
      policy_type,
      expiration_date,
      client_email,
      client_phone,
      agent_name,
      agent_email,
      expiring_premium,
    } = body

    if (!renewal_id || !expiration_date) {
      return NextResponse.json({ error: 'renewal_id and expiration_date are required' }, { status: 400 })
    }

    // Check if workflow already exists for this renewal
    const { data: existing } = await supabase
      .from('renewal_workflows')
      .select('id')
      .eq('renewal_id', renewal_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Workflow already exists for this renewal', workflowId: existing.id }, { status: 409 })
    }

    // Create workflow
    const { data: workflow, error: wfError } = await supabase
      .from('renewal_workflows')
      .insert({
        renewal_id,
        policy_number,
        named_insured,
        policy_type,
        expiration_date,
        client_email,
        client_phone,
        agent_name,
        agent_email,
        expiring_premium,
        current_phase: 'planning',
        status: 'active',
      })
      .select()
      .single()

    if (wfError) return NextResponse.json({ error: wfError.message }, { status: 500 })

    // Calculate due dates based on expiration_date
    const expDate = new Date(expiration_date)
    const phaseDueDates: Record<string, Date> = {
      planning: new Date(expDate.getTime() - 90 * 24 * 60 * 60 * 1000),
      execution: new Date(expDate.getTime() - 45 * 24 * 60 * 60 * 1000),
      finalization: new Date(expDate.getTime() - 0 * 24 * 60 * 60 * 1000),
      post_renewal: new Date(expDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    }

    // Seed default tasks
    const tasks = DEFAULT_TASKS.map((t) => ({
      ...t,
      workflow_id: workflow.id,
      status: 'pending',
      due_date: phaseDueDates[t.phase],
    }))

    const { error: tasksError } = await supabase.from('renewal_workflow_tasks').insert(tasks)
    if (tasksError) console.error('Failed to seed tasks:', tasksError)

    return NextResponse.json({ data: workflow }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
