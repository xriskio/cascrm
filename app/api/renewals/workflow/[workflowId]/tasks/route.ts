import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { workflowId: string } }) {
  const { data, error } = await supabaseAdmin.from('renewal_tasks').select('*').eq('workflow_id', params.workflowId).order('due_date')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
