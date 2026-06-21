import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const API = process.env.QQCATALYST_API_URL || 'https://api.qqcatalyst.com/v1'
const TOKEN = process.env.QQ_BEARER_TOKEN || ''

async function qqGet(path: string) {
  if (!TOKEN) throw new Error('QQ_BEARER_TOKEN not set')
  const r = await fetch(API + '/' + path, { headers: { Authorization: 'Bearer ' + TOKEN }, cache: 'no-store' })
  if (!r.ok) throw new Error('QQ API ' + r.status)
  return r.json()
}

function scoreContact(c: any): number {
  let s = 40
  const prem = parseFloat(c.EstimatedAnnualPremium || c.premium || 0)
  if (prem > 20000) s += 20
  else if (prem > 5000) s += 15
  else if (prem > 1000) s += 10
  const ind = (c.Industry || c.BusinessType || '').toLowerCase()
  if (ind.includes('truck') || ind.includes('limousine') || ind.includes('limo')) s += 10
  const yrs = parseInt(c.YearsInBusiness || c.yearsInBusiness || 0)
  if (yrs > 5) s += 10
  else if (yrs > 2) s += 5
  if (c.ContactType === 'Customer') s += 5
  return Math.min(s, 100)
}

function prioritize(score: number, prem: number): string {
  if (prem > 20000) return 'urgent'
  if (score >= 75) return 'high'
  if (score >= 55) return 'medium'
  return 'low'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const sourceName = body.source || 'qq_catalyst'

    // Get source config
    const { data: source } = await supabaseAdmin
      .from('lead_sources')
      .select('*')
      .eq('source_name', sourceName)
      .single()

    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 })

    // Create sync job
    const { data: job } = await supabaseAdmin
      .from('lead_sync_jobs')
      .insert({ lead_source_id: source.id, job_type: 'incremental_sync', status: 'running', triggered_by: 'manual' })
      .select().single()

    const today = new Date().toISOString().split('T')[0]
    const lastSync = source.last_sync_time ? source.last_sync_time.split('T')[0] : '2000-01-01'

    let contacts: any[] = []

    if (sourceName === 'qq_catalyst') {
      for (let i = 1; i <= 5; i++) {
        const d = await qqGet('Contacts/LastModifiedCreated?startDate=' + lastSync + '&endDate=' + today + '&pageNumber=' + i + '&pageSize=100')
        if (!d?.IsSuccess || !d?.Data?.length) break
        contacts.push(...d.Data)
        if (i >= (d.PagesTotal || 1)) break
      }
    } else {
      // Website sources: query from leads table by source
      const { data } = await supabaseAdmin.from('leads').select('*').eq('source', sourceName).gte('created_at', lastSync + 'T00:00:00Z')
      contacts = data || []
    }

    let imported = 0, dupes = 0, failed = 0
    const importedIds: string[] = []

    for (const c of contacts) {
      try {
        const email = (c.Email || c.email || '').toLowerCase()
        const phone = (c.Phone || c.phone || '').replace(/\D/g, '')
        const company = (c.BusinessName || c.CompanyName || c.company_name || '').toLowerCase()
        const firstName = c.FirstName || c.first_name || ''
        const lastName = c.LastName || c.last_name || ''
        const sourceId = String(c.ContactID || c.Id || c.id || '')

        // Dedup: email
        if (email) {
          const { data: existing } = await supabaseAdmin.from('leads').select('id').ilike('email', email).single()
          if (existing) {
            dupes++
            await supabaseAdmin.from('raw_lead_imports').insert({ lead_source_id: source.id, source_contact_id: sourceId, source_brand: sourceName, raw_data: c, processing_status: 'duplicate', duplicate_check_result: { isDuplicate: true, matchedBy: 'email', existingLeadId: existing.id }, mapped_to_lead_id: existing.id })
            continue
          }
        }

        // Dedup: phone
        if (phone && phone.length >= 10) {
          const { data: phoneMatch } = await supabaseAdmin.from('leads').select('id').ilike('phone', '%' + phone.slice(-10) + '%').maybeSingle()
          if (phoneMatch) {
            dupes++
            await supabaseAdmin.from('raw_lead_imports').insert({ lead_source_id: source.id, source_contact_id: sourceId, source_brand: sourceName, raw_data: c, processing_status: 'duplicate', duplicate_check_result: { isDuplicate: true, matchedBy: 'phone', existingLeadId: phoneMatch.id } })
            continue
          }
        }

        const score = scoreContact(c)
        const prem = parseFloat(c.EstimatedAnnualPremium || c.premium || 0)
        const leadId = 'LEAD-' + sourceName.toUpperCase().slice(0,3) + '-' + Date.now() + '-' + Math.random().toString(36).slice(2,6).toUpperCase()

        const { data: newLead, error: le } = await supabaseAdmin.from('leads').insert({
          lead_id: leadId,
          contact_name: [firstName, lastName].filter(Boolean).join(' ') || company || 'Unknown',
          company_name: c.BusinessName || c.CompanyName || c.company_name || null,
          email: email || null,
          phone: c.Phone || c.phone || null,
          source: sourceName,
          status: 'new',
          priority: prioritize(score, prem),
          lead_type: c.Industry || c.BusinessType || c.policy_type || 'General',
          date_entered: new Date().toISOString(),
          lead_score: score,
          estimated_annual_premium: prem || null,
          qq_contact_id: sourceId || null,
        }).select().single()

        if (le || !newLead) { failed++; continue }

        await supabaseAdmin.from('raw_lead_imports').insert({ lead_source_id: source.id, source_contact_id: sourceId, source_brand: sourceName, raw_data: c, processing_status: 'success', mapped_to_lead_id: newLead.id, processed_at: new Date().toISOString() })

        const assignTo = resolveAssignee(c, source.assignment_rules)
        await supabaseAdmin.from('lead_assignment_queue').insert({ lead_id: newLead.id, queue_status: 'pending', priority: prioritize(score, prem), source_brand: sourceName, source_type: source.source_type })

        if (assignTo) {
          await supabaseAdmin.from('leads').update({ assigned_agent: assignTo }).eq('id', newLead.id)
          await supabaseAdmin.from('lead_assignment_queue').update({ queue_status: 'assigned', assigned_to: assignTo, assigned_by: 'system', assignment_method: 'auto_rule', assigned_at: new Date().toISOString() }).eq('lead_id', newLead.id)
        }

        imported++
        importedIds.push(newLead.id)
      } catch(e: any) { failed++; console.error('Lead import error:', e.message) }
    }

    await supabaseAdmin.from('lead_sources').update({ last_sync_time: new Date().toISOString(), last_successful_sync: new Date().toISOString(), last_sync_lead_count: imported, total_leads_imported: (source.total_leads_imported || 0) + imported, sync_error_count: 0 }).eq('id', source.id)
    await supabaseAdmin.from('lead_sync_jobs').update({ status: 'success', completed_at: new Date().toISOString(), records_attempted: contacts.length, records_success: imported, records_duplicate: dupes, records_failed: failed, imported_lead_ids: importedIds }).eq('id', job?.id)

    return NextResponse.json({ success: true, source: sourceName, total: contacts.length, imported, duplicates: dupes, failed, message: 'Imported ' + imported + ' leads from ' + sourceName })
  } catch(e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

function resolveAssignee(contact: any, rules: any): string | null {
  if (!rules) return null
  const ind = (contact.Industry || contact.BusinessType || '').toLowerCase()
  if (rules.byIndustry) {
    if (ind.includes('truck') && rules.byIndustry.trucking) return rules.byIndustry.trucking
    if ((ind.includes('limo') || ind.includes('tnc')) && rules.byIndustry.limousine) return rules.byIndustry.limousine
    if (rules.byIndustry.default) return rules.byIndustry.default
  }
  if (rules.default) return rules.default
  return null
}

export async function GET() {
  const { data: sources } = await supabaseAdmin.from('lead_sources').select('*').order('source_name')
  const { data: jobs } = await supabaseAdmin.from('lead_sync_jobs').select('*, lead_sources(display_name)').order('started_at', { ascending: false }).limit(10)
  const { data: queue } = await supabaseAdmin.from('lead_assignment_queue').select('*').eq('queue_status', 'pending').order('priority').limit(20)
  return NextResponse.json({ sources: sources || [], recentJobs: jobs || [], pendingQueue: queue || [] })
}
