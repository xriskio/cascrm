import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { submissionId, carrier, carrierEmail, coverageTypes, requestedLimits, specialRequirements, assignedAgent } = await req.json()

  const { data: sub } = await sb.from('submissions').select('status').eq('id', submissionId).single()
  if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  if (!['ready', 'submitted'].includes(sub.status)) {
    return NextResponse.json({ error: 'Submission must be in ready status before placement' }, { status: 400 })
  }

  const year = new Date().getFullYear()
  const placementNumber = 'PLACE-' + year + '-' + Math.floor(Math.random() * 9999).toString().padStart(4, '0')

  const { data: placement, error } = await sb.from('market_submissions').insert({
    submission_id: submissionId, placement_number: placementNumber,
    carrier_name: carrier, carrier_email: carrierEmail,
    coverage_types: coverageTypes, requested_limits: requestedLimits,
    special_requirements: specialRequirements, assigned_agent: assignedAgent,
    status: 'submitted', carrier_appetite: 'moderate',
    submitted_date: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await sb.from('placement_timeline').insert({
    placement_id: placement.id, status_change_to: 'submitted',
    event_description: 'Placement submitted to ' + carrier, event_type: 'status_change',
    changed_by: assignedAgent || 'system',
  })

  await sb.from('submissions').update({ status: 'submitted', submitted_date: new Date().toISOString() }).eq('id', submissionId)
  return NextResponse.json(placement, { status: 201 })
}