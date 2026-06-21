import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { leadId, insuredName, coverageTypes, requestedLimits, estimatedAnnualPremium, assignedAgent } = await req.json()

  const { data: lead } = await sb.from('leads').select('*').eq('id', leadId).single()
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const year = new Date().getFullYear()
  const submissionNumber = 'SUB-' + year + '-' + Math.floor(Math.random() * 9999).toString().padStart(4, '0')

  const { data: submission, error } = await sb.from('submissions').insert({
    lead_id: leadId, submission_number: submissionNumber,
    insured_name: insuredName, client_name: lead.company_name || lead.contact_name,
    coverage_types: coverageTypes, requested_limits: requestedLimits,
    estimated_annual_premium: estimatedAnnualPremium,
    assigned_agent: assignedAgent, status: 'draft',
    risk_profile: 'good', risk_rating: 50,
    policy_type: lead.lead_type || 'Commercial',
  }).select().single()

  if (error) {
    // Columns not yet added - fall back to existing columns only
    const { data: fb, error: e2 } = await sb.from("submissions").insert({
      client_name: lead.company_name || lead.contact_name,
      policy_type: lead.lead_type || "Commercial",
      assigned_agent: assignedAgent, status: "draft",
    }).select().single()
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
    return NextResponse.json(fb, { status: 201 })
  }

  const items = [
    'Tax Returns (Last 3 Years)', 'Profit & Loss Statement', 'Loss Runs / Claims History',
    'Employee List & Payroll', 'Vehicle/Equipment List',
    'Business Description & Operations', 'Safety Procedures Documentation',
  ]
  await sb.from('underwriting_checklist').insert(
    items.map((name, i) => ({ submission_id: submission.id, item_name: name, item_type: 'document', is_required: true, display_order: i }))
  )

  await sb.from('leads').update({ status: 'qualified', stage: 'submission_prep' }).eq('id', leadId)
  return NextResponse.json(submission, { status: 201 })
}