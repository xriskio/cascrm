import { type NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY || '')

export async function POST(req: NextRequest, { params }: { params: { workflowId: string } }) {
  try {
    const { selectedQuoteId, bindDate, policyEffectiveDate, clientEmail, clientName } = await req.json()
    if (!selectedQuoteId) return NextResponse.json({ error: 'selectedQuoteId required' }, { status: 400 })

    const { data: wf } = await supabaseAdmin.from('renewal_workflows').select('*').eq('id', params.workflowId).single()
    if (!wf) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })

    const { data: quote } = await supabaseAdmin.from('renewal_quotes').select('*').eq('id', selectedQuoteId).single()
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

    // Mark quote as bound
    await supabaseAdmin.from('renewal_quotes').update({ status: 'bound', selected_at: new Date().toISOString() }).eq('id', selectedQuoteId)

    // Reject other quotes
    await supabaseAdmin.from('renewal_quotes')
      .update({ status: 'rejected' })
      .eq('workflow_id', params.workflowId)
      .neq('id', selectedQuoteId)
      .neq('status', 'bound')

    // Complete finalization phase
    await supabaseAdmin.from('renewal_phases')
      .update({ status: 'completed', completed_at: new Date().toISOString(), completion_percent: 100 })
      .eq('workflow_id', params.workflowId).eq('phase', 'finalization')

    // Update workflow to bound
    const { data: updated } = await supabaseAdmin.from('renewal_workflows')
      .update({
        status: 'bound',
        preferred_carrier: quote.carrier,
        bind_date: new Date(bindDate || Date.now()).toISOString(),
        percent_complete: 100,
        best_quote_premium: quote.total_premium,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.workflowId).select().single()

    // Log activity
    await supabaseAdmin.from('renewal_activity_log').insert({
      workflow_id: params.workflowId,
      activity_type: 'policy_bound',
      description: 'Policy BOUND with ' + quote.carrier + ' at $' + parseFloat(quote.total_premium).toLocaleString() + (policyEffectiveDate ? '. Effective: ' + policyEffectiveDate : ''),
      actor_role: 'agent',
      new_value: { status: 'bound', carrier: quote.carrier, premium: quote.total_premium },
      visible_to_client: true
    })

    // Send binding confirmation email via Resend
    if (clientEmail && process.env.RESEND_API_KEY) {
      const html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#16a34a;padding:30px;text-align:center;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0">✅ Coverage Bound!</h1></div><div style="padding:30px;background:#f9fafb"><p>Hi <strong>' + (clientName || 'Valued Client') + '</strong>,</p><p>Your <strong>' + wf.policy_type + '</strong> policy ('+wf.policy_number+') has been successfully renewed!</p><div style="background:white;padding:20px;border-left:4px solid #16a34a;border-radius:4px;margin:20px 0"><strong>New Carrier:</strong> ' + quote.carrier + '<br><strong>New Premium:</strong> $' + parseFloat(quote.total_premium).toLocaleString() + '/year<br><strong>Effective Date:</strong> ' + (policyEffectiveDate || new Date(wf.expiration_date).toLocaleDateString()) + '</div><p>Your policy documents will be delivered within 5-7 business days. Thank you for trusting Casurance!</p></div><div style="background:#1f2937;color:white;padding:20px;text-align:center;border-radius:0 0 8px 8px"><p style="margin:0">© 2026 Casurance Agency</p></div></div>'
      await resend.emails.send({ from: 'renewals@casurance.com', to: clientEmail, subject: '✅ Your ' + wf.policy_type + ' Policy Has Been Renewed — ' + quote.carrier, html })
    }

    return NextResponse.json({ success: true, workflow: updated, quote, message: 'Policy bound with ' + quote.carrier + ' at $' + parseFloat(quote.total_premium).toLocaleString() })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
