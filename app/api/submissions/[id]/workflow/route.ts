import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  const [subRes, checklistRes, notesRes] = await Promise.all([
    supabase.from('submissions').select('*').eq('id', id).single(),
    supabase.from('underwriting_checklist').select('*').eq('submission_id', id).order('display_order'),
    supabase.from('submission_notes').select('*').eq('submission_id', id).order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    submission: subRes.data,
    checklist: checklistRes.data || [],
    notes: notesRes.data || [],
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('submissions')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submission: data })
}