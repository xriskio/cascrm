import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'

// GET /api/renewals/workflow/[workflowId] — full context in one call
export async function GET(req: NextRequest, { params }: { params: { workflowId: string } }) {
  try {
    const [{ data: workflow }, { data: phases }, { data: tasks }, { data: quotes }, { data: notifications }, { data: activityLog }] = await Promise.all([
      supabaseAdmin.from('renewal_workflows').select('*').eq('id', params.workflowId).single(),
      supabaseAdmin.from('renewal_phases').select('*').eq('workflow_id', params.workflowId).order('start_date'),
      supabaseAdmin.from('renewal_tasks').select('*').eq('workflow_id', params.workflowId).order('due_date'),
      supabaseAdmin.from('renewal_quotes').select('*').eq('workflow_id', params.workflowId).order('total_premium'),
      supabaseAdmin.from('renewal_notifications').select('*').eq('workflow_id', params.workflowId).order('sent_at', { ascending: false }),
      supabaseAdmin.from('renewal_activity_log').select('*').eq('workflow_id', params.workflowId).order('created_at', { ascending: false }).limit(25),
    ])
    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    return NextResponse.json({ workflow, phases: phases||[], tasks: tasks||[], quotes: quotes||[], notifications: notifications||[], activityLog: activityLog||[] })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

// DELETE /api/renewals/workflow/[workflowId] — cancel workflow
export async function DELETE(req: NextRequest, { params }: { params: { workflowId: string } }) {
  const { error } = await supabaseAdmin.from('renewal_workflows').delete().eq('id', params.workflowId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
