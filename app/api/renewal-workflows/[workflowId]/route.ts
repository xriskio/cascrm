import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params
    const supabase = supabaseAdmin

    const { data: workflow, error } = await supabase
      .from('renewal_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const { data: tasks } = await supabase
      .from('renewal_workflow_tasks')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('phase')
      .order('sort_order')

    const { data: notifications } = await supabase
      .from('renewal_workflow_notifications')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('sent_at', { ascending: false })

    const now = new Date()
    const daysToExpiry = workflow.expiration_date
      ? Math.ceil((new Date(workflow.expiration_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null

    const phases = ['planning', 'execution', 'finalization', 'post_renewal']
    const tasksByPhase = phases.reduce((acc: Record<string, typeof tasks>, phase) => {
      acc[phase] = (tasks || []).filter((t) => t.phase === phase)
      return acc
    }, {})

    const phaseProgress = phases.reduce((acc: Record<string, number>, phase) => {
      const phaseTasks = (tasks || []).filter((t) => t.phase === phase)
      const completed = phaseTasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length
      acc[phase] = phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0
      return acc
    }, {})

    return NextResponse.json({
      data: { ...workflow, days_to_expiry: daysToExpiry },
      tasks,
      tasksByPhase,
      phaseProgress,
      notifications: notifications || [],
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params
    const body = await request.json()
    const supabase = supabaseAdmin

    const { data, error } = await supabase
      .from('renewal_workflows')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', workflowId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
