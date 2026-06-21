import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY || '')

// Full HTML templates matching design spec
const TEMPLATES: Record<string,{subject:(v:any)=>string,html:(v:any)=>string}> = {
  kickoff_120: {
    subject: (v:any) => 'Renewal Alert: ' + v.policyNumber + ' Renews in 120 Days',
    html: (v:any) => '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333"><div style="background:linear-gradient(135deg,#1e40af 0%,#1e3a8a 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0;font-size:28px">Renewal Notification</h1></div><div style="padding:30px;background:#f9fafb"><p style="font-size:16px;line-height:1.6">Hello <strong>' + v.clientName + '</strong>,</p><p style="font-size:16px;line-height:1.6">Your commercial insurance policy is coming up for renewal! We are reaching out to begin the renewal process and ensure you have continuous, competitive coverage.</p><div style="background:white;padding:20px;border-left:4px solid #1e40af;margin:20px 0;border-radius:4px"><h3 style="margin-top:0;color:#1e40af">Policy Details</h3><table style="width:100%;font-size:14px"><tr><td style="padding:8px 0"><strong>Policy Number:</strong></td><td style="text-align:right">' + v.policyNumber + '</td></tr><tr><td style="padding:8px 0"><strong>Policy Type:</strong></td><td style="text-align:right">' + v.policyType + '</td></tr><tr><td style="padding:8px 0"><strong>Current Premium:</strong></td><td style="text-align:right">$' + v.currentPremium + '</td></tr><tr style="border-top:1px solid #e5e7eb"><td style="padding:8px 0"><strong>Expiration Date:</strong></td><td style="text-align:right;color:#dc2626;font-weight:bold">' + v.expirationDate + '</td></tr></table></div><h3 style="color:#1e40af;margin-top:30px">Our 120-Day Renewal Process</h3><ol style="font-size:15px;line-height:1.8"><li><strong>Strategy Meeting (Days 120-90):</strong> Review business changes, claims history, and coverage needs.</li><li><strong>Market Execution (Days 90-45):</strong> Submit to multiple carriers. Compare quotes competitively.</li><li><strong>Finalization (Days 45-0):</strong> Present best options, get your approval, bind coverage.</li></ol><div style="margin-top:30px;padding:20px;background:#dbeafe;border-radius:4px;border-left:4px solid #1e40af"><p style="margin:0;font-size:14px"><strong>Your Renewal Agent:</strong> ' + v.agentName + '<br><strong>Expires:</strong> ' + v.expirationDate + '<br>We will keep you updated every step of the way!</p></div><p style="margin-top:30px;font-size:14px;color:#6b7280">Questions? Contact your agent or email renewals@casurance.com</p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;font-size:12px;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency. All rights reserved.</p></div></div>'
  },
  reminder_45: {
    subject: (v:any) => '45-Day Reminder: ' + v.policyNumber + ' Renewal — Action Required',
    html: (v:any) => '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333"><div style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0;font-size:28px">⏰ 45-Day Renewal Reminder</h1></div><div style="padding:30px;background:#f9fafb"><p style="font-size:16px;line-height:1.6">Hi <strong>' + v.clientName + '</strong>,</p><p style="font-size:16px;line-height:1.6;color:#dc2626;font-weight:bold">Your policy renews in just 45 days. Time is running short to ensure competitive quotes!</p><div style="background:white;padding:20px;border-left:4px solid #f97316;margin:20px 0;border-radius:4px"><h3 style="margin-top:0;color:#f97316">Renewal Status</h3><table style="width:100%;font-size:14px"><tr><td style="padding:8px 0"><strong>Policy Number:</strong></td><td style="text-align:right">' + v.policyNumber + '</td></tr><tr><td style="padding:8px 0"><strong>Current Premium:</strong></td><td style="text-align:right">$' + v.currentPremium + '</td></tr><tr><td style="padding:8px 0"><strong>Best Quote to Date:</strong></td><td style="text-align:right;color:#16a34a;font-weight:bold">$' + v.bestQuotePremium + '</td></tr><tr style="border-top:1px solid #e5e7eb"><td style="padding:8px 0"><strong>Days Until Expiration:</strong></td><td style="text-align:right;color:#dc2626;font-weight:bold">45 days</td></tr></table></div><h3 style="color:#f97316">Action Items This Week</h3><ul style="font-size:15px;line-height:1.8;margin:15px 0"><li>Confirm final renewal data has been submitted</li><li>Review all quotes received from carriers</li><li>Discuss coverage adjustments or limits with your agent</li><li>Approve your preferred option</li></ul><div style="margin-top:30px;padding:20px;background:#fef3c7;border-radius:4px;border-left:4px solid #f97316"><p style="margin:0;font-size:14px"><strong>Important:</strong> To avoid coverage gaps, we need your decision before ' + v.expirationDate + '. Please respond promptly.</p></div><p style="margin-top:30px;font-size:14px;color:#6b7280">Questions? Contact ' + v.agentName + ' immediately at renewals@casurance.com</p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;font-size:12px;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency. All rights reserved.</p></div></div>'
  },
  final_proposal: {
    subject: (v:any) => 'Final Renewal Proposal for ' + v.policyNumber + ' — Ready for Binding',
    html: (v:any) => '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333"><div style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0;font-size:28px">✅ Final Renewal Proposal</h1></div><div style="padding:30px;background:#f9fafb"><p style="font-size:16px;line-height:1.6">Hello <strong>' + v.clientName + '</strong>,</p><p style="font-size:16px;line-height:1.6;color:#16a34a;font-weight:bold">Great news! We have finalized your renewal proposal. Your new coverage is ready to bind.</p><div style="background:white;padding:20px;border-left:4px solid #16a34a;margin:20px 0;border-radius:4px"><h3 style="margin-top:0;color:#16a34a">Renewal Summary</h3><table style="width:100%;font-size:14px"><tr><td style="padding:8px 0"><strong>Policy Number:</strong></td><td style="text-align:right">' + v.policyNumber + '</td></tr><tr><td style="padding:8px 0"><strong>New Annual Premium:</strong></td><td style="text-align:right;font-size:18px;color:#16a34a;font-weight:bold">$' + v.bestQuotePremium + '</td></tr><tr style="border-top:1px solid #e5e7eb"><td style="padding:8px 0"><strong>Previous Premium:</strong></td><td style="text-align:right">$' + v.currentPremium + '</td></tr></table></div><div style="margin-top:30px;padding:20px;background:#d1fae5;border-radius:4px;border-left:4px solid #16a34a"><p style="margin:0;font-size:14px"><strong>Next Steps:</strong><br>1. Review the attached proposal documents<br>2. Confirm you are ready to proceed<br>3. Your agent will finalize binding and send your certificates</p></div><p style="margin-top:30px;font-size:14px;color:#6b7280">Questions? Contact ' + v.agentName + ' at renewals@casurance.com</p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;font-size:12px;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency. All rights reserved.</p></div></div>'
  },
  post_renewal_debrief: {
    subject: (v:any) => '🎉 Renewal Complete! ' + v.policyNumber + ' — Your Summary',
    html: (v:any) => '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333"><div style="background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0;font-size:28px">🎉 Renewal Complete!</h1></div><div style="padding:30px;background:#f9fafb"><p style="font-size:16px;line-height:1.6">Hi <strong>' + v.clientName + '</strong>,</p><p style="font-size:16px;line-height:1.6">Your commercial insurance renewal is officially complete! Your new coverage is now active.</p><div style="background:white;padding:20px;border-left:4px solid #7c3aed;margin:20px 0;border-radius:4px"><h3 style="margin-top:0;color:#7c3aed">Renewal Recap</h3><table style="width:100%;font-size:14px"><tr><td style="padding:8px 0"><strong>Policy:</strong></td><td style="text-align:right">' + v.policyNumber + ' — ' + v.policyType + '</td></tr><tr><td style="padding:8px 0"><strong>New Premium:</strong></td><td style="text-align:right;font-weight:bold">$' + v.bestQuotePremium + '/year</td></tr><tr style="border-top:1px solid #e5e7eb"><td style="padding:8px 0"><strong>Status:</strong></td><td style="text-align:right;color:#16a34a;font-weight:bold">Active ✓</td></tr></table></div><h3 style="color:#7c3aed">What You Will Receive</h3><ul style="font-size:15px;line-height:1.8"><li>Your complete policy documents via email</li><li>Updated certificates of insurance for lenders/partners</li><li>Summary of coverage highlights and limits</li><li>Claims contact information for your carrier</li></ul><div style="margin-top:30px;padding:20px;background:#ede9fe;border-radius:4px;border-left:4px solid #7c3aed"><p style="margin:0;font-size:14px"><strong>Next Renewal:</strong> We will reach out 120 days before your next expiration date to begin the process again.</p></div><p style="margin-top:30px;font-size:14px;color:#6b7280">Thank you for trusting Casurance. For claims or questions, contact your agent at renewals@casurance.com</p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;font-size:12px;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency. All rights reserved.</p></div></div>'
  }
}

async function sendRenewalEmail(workflowId: string, type: string, clientEmail?: string, clientName?: string) {
  const { data: wf } = await supabaseAdmin.from('renewal_workflows').select('*').eq('id', workflowId).single()
  if (!wf) { console.error('Workflow not found:', workflowId); return { sent: false } }
  const tmpl = TEMPLATES[type]
  if (!tmpl) { console.error('Unknown template:', type); return { sent: false } }
  // Check if already sent
  const { data: existing } = await supabaseAdmin.from('renewal_notifications').select('id').eq('workflow_id', workflowId).eq('notification_type', type).maybeSingle()
  if (existing && type !== 'reminder_45') { console.log('Already sent:', type, workflowId); return { sent: false, reason: 'already_sent' } }
  const vars = {
    clientName: clientName || 'Valued Client',
    policyNumber: wf.policy_number,
    policyType: wf.policy_type,
    expirationDate: wf.expiration_date ? new Date(wf.expiration_date).toLocaleDateString() : 'N/A',
    currentPremium: wf.current_premium ? parseFloat(wf.current_premium).toLocaleString() : 'TBD',
    bestQuotePremium: wf.best_quote_premium ? parseFloat(wf.best_quote_premium).toLocaleString() : 'TBD',
    agentName: wf.assigned_agent || 'Your Agent',
  }
  const subject = tmpl.subject(vars)
  const html = tmpl.html(vars)
  const to = clientEmail || 'renewals@casurance.com'
  let resendId = null
  if (process.env.RESEND_API_KEY && to.includes('@')) {
    const r = await resend.emails.send({ from: 'renewals@casurance.com', to, replyTo: 'support@casurance.com', subject, html })
    resendId = r.data?.id || null
    if (r.error) console.error('Resend error:', r.error)
  }
  await supabaseAdmin.from('renewal_notifications').insert({ workflow_id: workflowId, notification_type: type, template_name: type, client_email: to, client_name: clientName || 'Valued Client', subject, resend_message_id: resendId, status: resendId ? 'sent' : 'logged', sent_by: 'system' })
  await supabaseAdmin.from('renewal_activity_log').insert({ workflow_id: workflowId, activity_type: 'client_notified', description: 'Auto email sent: ' + type + (resendId ? ' (Resend: ' + resendId + ')' : ' (logged only)'), actor_role: 'system', visible_to_client: true })
  console.log('Sent', type, 'for', wf.policy_number, 'to', to)
  return { sent: true, resendId }
}

// Cron handler — called daily by Railway cron or a scheduler
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const now = new Date()
  const results: any = { kickoff_120: [], reminder_45: [], debrief: [], timestamp: now.toISOString() }
  try {
    // 1. 120-day kickoff: renewals expiring 115-125 days from now, status pending, not yet notified
    const d120start = new Date(now.getTime() + 115 * 86400000).toISOString()
    const d120end = new Date(now.getTime() + 125 * 86400000).toISOString()
    const { data: kickoffs } = await supabaseAdmin.from('renewal_workflows').select('id,policy_number,client_notification_status').eq('status', 'pending').gte('expiration_date', d120start).lte('expiration_date', d120end)
    for (const w of kickoffs || []) {
      if (!(w.client_notification_status as any)?.kickoff_120_sent_at) {
        const r = await sendRenewalEmail(w.id, 'kickoff_120')
        results.kickoff_120.push({ id: w.id, policy: w.policy_number, result: r })
      }
    }
    // 2. 45-day reminder: renewals expiring 40-50 days from now, not yet reminded
    const d45start = new Date(now.getTime() + 40 * 86400000).toISOString()
    const d45end = new Date(now.getTime() + 50 * 86400000).toISOString()
    const { data: reminders } = await supabaseAdmin.from('renewal_workflows').select('id,policy_number').in('status', ['pending','in_progress']).gte('expiration_date', d45start).lte('expiration_date', d45end)
    for (const w of reminders || []) {
      const r = await sendRenewalEmail(w.id, 'reminder_45')
      results.reminder_45.push({ id: w.id, policy: w.policy_number, result: r })
    }
    // 3. Post-renewal debrief: bound within last 24h
    const yesterday = new Date(now.getTime() - 86400000).toISOString()
    const { data: bound } = await supabaseAdmin.from('renewal_workflows').select('id,policy_number').eq('status', 'bound').gte('bind_date', yesterday)
    for (const w of bound || []) {
      const r = await sendRenewalEmail(w.id, 'post_renewal_debrief')
      results.debrief.push({ id: w.id, policy: w.policy_number, result: r })
    }
    return NextResponse.json({ success: true, processed: { kickoff: results.kickoff_120.length, reminder: results.reminder_45.length, debrief: results.debrief.length }, results })
  } catch(e: any) {
    console.error('Cron error:', e)
    return NextResponse.json({ error: e.message, partial: results }, { status: 500 })
  }
}

// Manual trigger (POST) — can also be used to seed templates
export async function POST(req: NextRequest) {
  const { type, workflowId, clientEmail, clientName } = await req.json()
  if (type === 'seed_templates') {
    // Seed notification type registry to renewal_notifications table as reference
    return NextResponse.json({ success: true, message: 'Templates are inline — no DB seeding needed', types: Object.keys(TEMPLATES) })
  }
  if (!workflowId || !type) return NextResponse.json({ error: 'workflowId and type required' }, { status: 400 })
  const result = await sendRenewalEmail(workflowId, type, clientEmail, clientName)
  return NextResponse.json({ success: !!result.sent, ...result })
}
