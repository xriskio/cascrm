import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
export const dynamic = 'force-dynamic'

// PATCH - update task status
export async function PATCH(req: NextRequest, { params }: { params: { workflowId: string; taskId: string } }) {
  try {
    const { status, task_notes } = await req.json()
    const update: any = { status, updated_at: new Date().toISOString() }
    if (status === 'completed') update.completed_at = new Date().toISOString()
    if (task_notes) update.task_notes = task_notes
    const { data, error } = await supabaseAdmin.from('renewal_tasks').update(update).eq('id', params.taskId).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // Update phase completion percent
    const task = await supabaseAdmin.from('renewal_tasks').select('phase_id').eq('id', params.taskId).single()
    if (task.data) {
      const allTasks = await supabaseAdmin.from('renewal_tasks').select('status').eq('phase_id', task.data.phase_id)
      if (allTasks.data) {
        const completed = allTasks.data.filter(t => t.status === 'completed').length
        const pct = Math.round((completed / allTasks.data.length) * 100)
        await supabaseAdmin.from('renewal_phases').update({ tasks_completed: completed, completion_percent: pct }).eq('id', task.data.phase_id)
      }
    }
    // Log activity
    await supabaseAdmin.from('renewal_activity_log').insert({ workflow_id: params.workflowId, activity_type: 'task_completed', description: 'Task marked as ' + status, actor_role: 'agent' })
    return NextResponse.json({ success: true, task: data })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
