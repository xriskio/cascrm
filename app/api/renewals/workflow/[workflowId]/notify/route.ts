import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY || '')

const TEMPLATES: Record<string,{subject:string,body:(d:any)=>string}> = {
  kickoff_120: {
    subject: (d: any) => 'Renewal Starting: ' + d.policyNumber + ' — 120 Days to Expiration',
    body: (d: any) => '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1e40af;padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0">Renewal Starting</h1></div><div style="padding:30px;background:#f9fafb"><p>Hello <strong>' + d.clientName + '</strong>,</p><p>Your <strong>' + d.policyType + '</strong> policy ('+d.policyNumber+') is coming up for renewal on <strong>' + d.expirationDate + '</strong>.</p><p>We will be shopping the market to find you the best coverage options. Our process:</p><ol><li><strong>Planning (Days 120-90):</strong> Review your coverage needs and gather updated business information</li><li><strong>Market Execution (Days 90-45):</strong> Submit to multiple carriers and collect competitive quotes</li><li><strong>Finalization (Days 45-0):</strong> Present best options, get approval, and bind coverage</li></ol><p>Your current premium: <strong>$' + (d.currentPremium ? parseFloat(d.currentPremium).toLocaleString() : 'TBD') + '</strong></p><p>Questions? Reply to this email or contact your agent: <strong>' + d.agentName + '</strong></p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency — renewals@casurance.com</p></div></div>'
  } as any,
  reminder_45: {
    subject: (d: any) => '⏰ 45 Days Left — ' + d.policyNumber + ' Renewal Quotes Ready',
    body: (d: any) => '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#f97316;padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0">45 Days to Expiration</h1></div><div style="padding:30px;background:#f9fafb"><p>Hi <strong>' + d.clientName + '</strong>,</p><p style="color:#dc2626;font-weight:bold">Your ' + d.policyType + ' policy expires in 45 days on ' + d.expirationDate + '.</p><p>We have collected quotes from multiple carriers. Best quote so far: <strong>$' + (d.bestQuote ? parseFloat(d.bestQuote).toLocaleString() : 'Pending') + '</strong></p><p>Please contact your agent to review options and approve your preferred carrier.</p><p><strong>' + d.agentName + '</strong></p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency</p></div></div>'
  } as any,
  post_renewal_debrief: {
    subject: (d: any) => '✅ Renewal Complete — ' + d.policyNumber + ' Summary',
    body: (d: any) => '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#7c3aed;padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0">🎉 Renewal Complete!</h1></div><div style="padding:30px;background:#f9fafb"><p>Hi <strong>' + d.clientName + '</strong>,</p><p>Your commercial insurance renewal is complete and your coverage is now active.</p><p>New premium: <strong>$' + (d.bestQuote ? parseFloat(d.bestQuote).toLocaleString() : 'See policy') + '/year</strong></p><p>Thank you for trusting Casurance with your insurance needs. Your next renewal begins in 11 months.</p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency</p></div></div>'
  } as any,
}

export async function POST(req: NextRequest, { params }: { params: { workflowId: string } }) {
  try {
    const { notificationType, clientEmail, clientName } = await req.json()
    const { data: wf } = await supabaseAdmin.from('renewal_workflows').select('*').eq('id', params.workflowId).single()
    if (!wf) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    const tmpl = TEMPLATES[notificationType]
    if (!tmpl) return NextResponse.json({ error: 'Unknown notification type: ' + notificationType }, { status: 400 })
    const vars = { policyNumber: wf.policy_number, policyType: wf.policy_type, expirationDate: wf.expiration_date ? new Date(wf.expiration_date).toLocaleDateString() : 'N/A', clientName: clientName || 'Valued Client', agentName: wf.assigned_agent, currentPremium: wf.current_premium, bestQuote: wf.best_quote_premium }
    const subject = (tmpl.subject as any)(vars)
    const html = (tmpl.body as any)(vars)
    let resendId = null
    if (clientEmail && process.env.RESEND_API_KEY) {
      const result = await resend.emails.send({ from: 'renewals@casurance.com', to: clientEmail, subject, html })
      resendId = result.data?.id || null
    }
    await supabaseAdmin.from('renewal_notifications').insert({ workflow_id: params.workflowId, notification_type: notificationType, template_name: notificationType, client_email: clientEmail || 'no-email', client_name: clientName || '', subject, resend_message_id: resendId, status: resendId ? 'sent' : 'logged', sent_by: wf.assigned_agent })
    await supabaseAdmin.from('renewal_activity_log').insert({ workflow_id: params.workflowId, activity_type: 'client_notified', description: 'Client notification sent: ' + notificationType, actor_role: 'system', visible_to_client: true })
    return NextResponse.json({ success: true, message: clientEmail ? 'Email sent to ' + clientEmail : 'Notification logged (no email configured)', resendId })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
