import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Seed the 4-workflow pipeline from real existing data
// Lead → Submission → Market Placement → Quote
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const limit = body.limit || 5
  const results: any = { leads: [], submissions: [], placements: [], quotes: [] }

  // ── STEP 1: Seed leads that don't have form_step yet ──────────────────────
  const { data: rawLeads } = await supabaseAdmin
    .from('leads').select('id,contact_name,company_name,email,phone,source,status,lead_type,date_entered,assigned_agent')
    .is('form_step', null).limit(limit)

  for (const lead of rawLeads || []) {
    const score = 40 + (lead.source === 'QQCatalyst' ? 10 : 0) + (lead.lead_type?.includes('WC') ? 5 : 0)
    await supabaseAdmin.from('leads').update({ form_step: 4, form_completion: 100, lead_score: score, stage: 'submission_prep' }).eq('id', lead.id)
    results.leads.push({ id: lead.id, name: lead.contact_name || lead.company_name })
  }

  // ── STEP 2: Seed underwriting checklists for submissions missing them ──────
  const { data: subs } = await supabaseAdmin.from('submissions').select('id,client_name,policy_type,tracking_number').limit(limit)
  for (const sub of subs || []) {
    const { data: existing } = await supabaseAdmin.from('underwriting_checklist').select('id').eq('submission_id', sub.id).limit(1)
    if (existing && existing.length > 0) continue
    const items = ['Tax Returns (Last 3 Years)','Profit & Loss Statement','Loss Runs / Claims History','Employee List & Payroll','Vehicle / Equipment List','Business Description','Safety Procedures Documentation']
    await supabaseAdmin.from('underwriting_checklist').insert(items.map((name, i) => ({ submission_id: sub.id, item_name: name, item_type: 'document', is_required: true, display_order: i, is_completed: false })))
    results.submissions.push({ id: sub.id, client: sub.client_name, checklist: items.length + ' items created' })
  }

  // ── STEP 3: Create market placements for quotes that don't have placements ─
  const { data: rawQuotes } = await supabaseAdmin.from('quotes').select('id,submission_id,carrier,quoted_premium,status').is('placement_id', null).limit(limit)
  for (const q of rawQuotes || []) {
    const num = 'PLACE-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2,8).toUpperCase()
    const { data: placement } = await supabaseAdmin.from('market_placements').insert({
      submission_id: q.submission_id || 'unknown', placement_number: num, carrier: q.carrier || 'Unknown Carrier',
      status: q.status === 'bound' ? 'bound' : q.quoted_premium ? 'quoted' : 'submitted',
      assigned_agent: 'wael@casurance.com',
      quote_received_date: q.quoted_premium ? new Date().toISOString() : null
    }).select().single()
    if (placement) {
      await supabaseAdmin.from('quotes').update({ placement_id: placement.id }).eq('id', q.id)
      await supabaseAdmin.from('placement_timeline').insert({ placement_id: placement.id, status_change_to: placement.status, event_description: 'Placement created from existing quote data', event_type: 'initial_import', changed_by: 'system' })
      results.placements.push({ id: placement.id, carrier: q.carrier, status: placement.status })
    }
  }

  // ── STEP 4: Mark bound quotes with acceptances ────────────────────────────
  const { data: boundQuotes } = await supabaseAdmin.from('quotes').select('id,carrier,quoted_premium,status').eq('status', 'bound').limit(limit)
  for (const q of boundQuotes || []) {
    const { data: existing } = await supabaseAdmin.from('quote_acceptances').select('id').eq('quote_id', q.id).maybeSingle()
    if (existing) continue
    await supabaseAdmin.from('quote_acceptances').insert({ quote_id: q.id, accepted_by: 'Client', binding_status: 'bound', binding_date: new Date().toISOString() })
    results.quotes.push({ id: q.id, carrier: q.carrier, premium: q.quoted_premium })
  }

  // ── STEP 5: Add leads to assignment queue ─────────────────────────────────
  const { data: unqueuedLeads } = await supabaseAdmin.from('leads').select('id,status,source').eq('status', 'new').limit(limit)
  let queued = 0
  for (const lead of unqueuedLeads || []) {
    const { data: inQueue } = await supabaseAdmin.from('lead_assignment_queue').select('id').eq('lead_id', lead.id).maybeSingle()
    if (inQueue) continue
    await supabaseAdmin.from('lead_assignment_queue').insert({ lead_id: lead.id, queue_status: 'pending', priority: 'medium', source_brand: lead.source || 'casurance', source_type: 'import' })
    queued++
  }

  return NextResponse.json({
    success: true,
    message: 'Pipeline seeded from your real data',
    seeded: {
      leadsUpdatedWithFormProgress: results.leads.length,
      submissionsWithChecklistCreated: results.submissions.length,
      marketPlacementsCreated: results.placements.length,
      quoteAcceptancesCreated: results.quotes.length,
      leadsAddedToQueue: queued,
    },
    details: results,
    nextSteps: [
      '1. Visit /pipeline to see the 4-stage overview with your real data counts',
      '2. Visit /leads to see leads with form_step, lead_score, stage populated',
      '3. Visit /submissions to see underwriting checklists created',
      '4. Visit /market-submissions to see market placements created from quotes',
      '5. Visit /quotes to see quotes with placement links',
      '6. Go to /leads/aggregation to import more leads from QQ Catalyst',
    ]
  })
}

export async function GET() {
  const [
    { count: leads }, { count: subs }, { count: placements },
    { count: quotes }, { count: queue }, { count: sources }
  ] = await Promise.all([
    supabaseAdmin.from('leads').select('*',{count:'exact',head:true}),
    supabaseAdmin.from('submissions').select('*',{count:'exact',head:true}),
    supabaseAdmin.from('market_placements').select('*',{count:'exact',head:true}).catch(()=>({count:0})),
    supabaseAdmin.from('quotes').select('*',{count:'exact',head:true}),
    supabaseAdmin.from('lead_assignment_queue').select('*',{count:'exact',head:true}).catch(()=>({count:0})),
    supabaseAdmin.from('lead_sources').select('*',{count:'exact',head:true}).catch(()=>({count:0})),
  ])
  const { data: queueBreakdown } = await supabaseAdmin.from('lead_assignment_queue').select('queue_status').then(r => ({ data: r.data?.reduce((acc: any, row: any) => { acc[row.queue_status] = (acc[row.queue_status]||0)+1; return acc }, {}) })).catch(() => ({ data: {} }))
  return NextResponse.json({
    pipeline: {
      'Stage 1 - Leads': leads || 0,
      'Stage 2 - Submissions': subs || 0,
      'Stage 3 - Market Placements': placements || 0,
      'Stage 4 - Quotes': quotes || 0,
    },
    leadQueue: queue || 0,
    queueByStatus: queueBreakdown || {},
    leadSources: sources || 0,
    seedInstruction: 'POST /api/admin/seed-pipeline-workflows with x-admin-secret header',
    hint: 'Run seed first, then visit /pipeline to see the full 4-stage workflow',
  })
}
