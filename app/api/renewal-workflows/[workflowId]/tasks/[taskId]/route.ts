import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { workflowId: string; taskId: string } }
) {
  try {
    const body = await request.json()
    const update: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }

    // Auto-set completed_at when marking complete
    if (body.status === 'completed' && !body.completed_at) {
      update.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('renewal_workflow_tasks')
      .update(update)
      .eq('id', params.taskId)
      .eq('workflow_id', params.workflowId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // After task update, recalculate phase and potentially advance workflow phase
    const { data: allTasks } = await supabaseAdmin
      .from('renewal_workflow_tasks')
      .select('phase, status')
      .eq('workflow_id', params.workflowId)

    if (allTasks) {
      const phases = ['planning', 'execution', 'finalization', 'post_renewal']
      const { data: workflow } = await supabaseAdmin
        .from('renewal_workflows')
        .select('current_phase')
        .eq('id', params.workflowId)
        .single()

      if (workflow) {
        const currentIdx = phases.indexOf(workflow.current_phase)
        const currentPhaseTasks = allTasks.filter((t) => t.phase === workflow.current_phase)
        const allCurrentDone = currentPhaseTasks.every((t) => t.status === 'completed' || t.status === 'skipped')

        if (allCurrentDone && currentIdx < phases.length - 1) {
          const nextPhase = phases[currentIdx + 1]
          await supabaseAdmin
            .from('renewal_workflows')
            .update({ current_phase: nextPhase, updated_at: new Date().toISOString() })
            .eq('id', params.workflowId)
        }

        // Mark workflow complete if all tasks done
        const allDone = allTasks.every((t) => t.status === 'completed' || t.status === 'skipped')
        if (allDone) {
          await supabaseAdmin
            .from('renewal_workflows')
            .update({ current_phase: 'complete', status: 'bound', updated_at: new Date().toISOString() })
            .eq('id', params.workflowId)
        }
      }
    }

    return NextResponse.json({ data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { workflowId: string; taskId: string } }
) {
  const { error } = await supabaseAdmin
    .from('renewal_workflow_tasks')
    .delete()
    .eq('id', params.taskId)
    .eq('workflow_id', params.workflowId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
