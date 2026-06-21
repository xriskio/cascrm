import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(_req: NextRequest, { params }: { params: { submissionId: string } }) {
  const sb = createClient()
  const { submissionId } = params

  const { data: items } = await sb.from('underwriting_checklist').select('*').eq('submission_id', submissionId)
  const required = (items || []).filter(i => i.is_required)
  const done = required.filter(i => i.is_completed)

  if (done.length < required.length) {
    return NextResponse.json({
      error: 'Cannot complete submission - missing required documents',
      completion_percent: Math.round((done.length / required.length) * 100),
      missing: required.filter(i => !i.is_completed).map(i => i.item_name),
    }, { status: 400 })
  }

  const { data, error } = await sb.from('submissions').update({
    status: 'ready', ready_to_submit_date: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', submissionId).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}