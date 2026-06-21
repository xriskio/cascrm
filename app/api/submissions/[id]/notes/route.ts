import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('submission_notes')
    .select('*')
    .eq('submission_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data || [] })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const body = await req.json()

  if (!body.content || !body.created_by)
    return NextResponse.json({ error: 'content and created_by required' }, { status: 400 })

  const { data, error } = await supabase.from('submission_notes').insert({
    submission_id: params.id,
    content: body.content,
    note_type: body.note_type || 'agent',
    created_by: body.created_by,
    is_internal: body.is_internal !== false,
    visible_to_carrier: body.visible_to_carrier || false,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note: data }, { status: 201 })
}