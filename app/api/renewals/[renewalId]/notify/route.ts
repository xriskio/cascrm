export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendRenewalProgressEmail } from "@/lib/email"
import {
  ACTIVE_PHASES,
  daysUntil,
  phaseForDays,
  progress,
  type WorkflowSteps,
} from "@/lib/renewals/workflow"

export async function POST(request: NextRequest, { params }: { params: { renewalId: string } }) {
  try {
    const id = params.renewalId
    const body = await request.json().catch(() => ({}))

    const { data: r, error } = await supabaseAdmin.from("renewals").select("*").eq("id", id).single()
    if (error || !r) {
      return NextResponse.json({ success: false, error: error?.message || "Renewal not found" }, { status: 404 })
    }
    const renewal = r as any

    const toEmail: string = body?.client_email || renewal.client_email
    if (!toEmail) {
      return NextResponse.json(
        { success: false, error: "No client email on file. Add one before notifying." },
        { status: 400 },
      )
    }

    const steps: WorkflowSteps = renewal.workflow_steps || {}
    const days = daysUntil(renewal.expiration_date)
    const phase = phaseForDays(days)
    const prog = progress(steps)
    const completedSteps = ACTIVE_PHASES.flatMap((p) => p.steps).filter((s) => steps[s.key]?.done).map((s) => s.label)
    const nextSteps = ACTIVE_PHASES.flatMap((p) => p.steps).filter((s) => !steps[s.key]?.done).slice(0, 3).map((s) => s.label)
    const clientName = renewal.client_name || renewal.named_insured || renewal.insured_name || "Valued Client"

    const result = await sendRenewalProgressEmail({
      clientName,
      clientEmail: toEmail,
      policyNumber: renewal.policy_number,
      policyType: renewal.lob || renewal.policy_type,
      carrier: renewal.carrier || renewal.insurance_company,
      expirationDate: renewal.expiration_date,
      phaseTitle: phase.title,
      progressPct: prog.pct,
      completedSteps,
      nextSteps,
    })

    await supabaseAdmin.from("renewal_notifications").insert({
      renewal_id: id,
      to_email: toEmail,
      subject: (result as any).subject || "Renewal progress update",
      phase: phase.id,
      progress: prog.pct,
      status: result.success ? "sent" : "failed",
      resend_id: (result as any).emailId || null,
      error: result.success ? null : (result as any).error || null,
    })

    if (result.success) {
      await supabaseAdmin
        .from("renewals")
        .update({ last_client_notified_at: new Date().toISOString(), client_email: toEmail })
        .eq("id", id)
      return NextResponse.json({ success: true, message: `Progress update sent to ${toEmail}.`, emailId: (result as any).emailId })
    }
    return NextResponse.json(
      { success: false, error: (result as any).error || "Email failed to send.", to: toEmail },
      { status: 502 },
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to notify client" },
      { status: 500 },
    )
  }
}
