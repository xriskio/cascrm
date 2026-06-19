import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('renewal_workflow_tasks')
    .select('*')
    .eq('workflow_id', params.workflowId)
    .order('phase')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('renewal_workflow_tasks')
      .insert({ ...body, workflow_id: params.workflowId, is_default: false, status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
