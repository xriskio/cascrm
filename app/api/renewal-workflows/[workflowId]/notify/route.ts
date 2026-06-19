import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendRenewalNotification } from "@/lib/email"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params
    const body = await request.json()
    const { notification_type, custom_message } = body

    const supabase = supabaseAdmin

    const { data: workflow, error: wfError } = await supabase
      .from('renewal_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (wfError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (!workflow.client_email) {
      return NextResponse.json({ error: 'No client email on file for this workflow' }, { status: 400 })
    }

    const result = await sendRenewalNotification({
      workflowId,
      notificationType: notification_type,
      clientName: workflow.named_insured || 'Valued Client',
      clientEmail: workflow.client_email,
      agentName: workflow.agent_name,
      agentEmail: workflow.agent_email,
      policyType: workflow.policy_type || 'Commercial Insurance',
      policyNumber: workflow.policy_number,
      expirationDate: workflow.expiration_date,
      expiringPremium: workflow.expiring_premium ? parseFloat(workflow.expiring_premium) : undefined,
      quotedPremium: workflow.quoted_premium ? parseFloat(workflow.quoted_premium) : undefined,
      boundPremium: workflow.bound_premium ? parseFloat(workflow.bound_premium) : undefined,
      customMessage: custom_message,
    })

    // Log notification regardless of success/failure
    await supabase.from('renewal_workflow_notifications').insert({
      workflow_id: workflowId,
      notification_type,
      recipient_email: workflow.client_email,
      recipient_name: workflow.named_insured,
      recipient_type: 'client',
      subject: `${notification_type} notification`,
      body_preview: custom_message || null,
      status: result.success ? 'sent' : 'failed',
      resend_id: result.emailId || null,
      error_message: result.error || null,
      sent_at: new Date().toISOString(),
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: result.emailId })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('renewal_workflow_notifications')
    .select('*')
    .eq('workflow_id', params.workflowId)
    .order('sent_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
