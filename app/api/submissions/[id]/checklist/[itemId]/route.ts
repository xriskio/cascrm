import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  const supabase = createClient()
  const body = await req.json()

  const updates: Record<string,unknown> = { updated_at: new Date().toISOString() }
  if (body.is_completed !== undefined) {
    updates.is_completed = body.is_completed
    updates.completed_at = body.is_completed ? new Date().toISOString() : null
    if (body.is_completed && body.completed_by) updates.completed_by = body.completed_by
  }
  if (body.notes !== undefined) updates.notes = body.notes

  const { data, error } = await supabase
    .from('underwriting_checklist')
    .update(updates)
    .eq('id', params.itemId)
    .eq('submission_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: all } = await supabase
    .from('underwriting_checklist')
    .select('is_completed,is_required')
    .eq('submission_id', params.id)

  const allReqDone = (all || []).filter(i => i.is_required).every(i => i.is_completed)
  if (allReqDone) {
    await supabase.from('submissions')
      .update({ status: 'ready', updated_at: new Date().toISOString() })
      .eq('id', params.id)
  }
  return NextResponse.json({ item: data, all_required_complete: allReqDone })
}