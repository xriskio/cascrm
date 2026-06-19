export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { WorkflowSteps } from "@/lib/renewals/workflow"

export async function PATCH(request: NextRequest, { params }: { params: { renewalId: string } }) {
  try {
    const id = params.renewalId
    const body = await request.json()
    const { stepKey, done, owner, client_email, by } = body || {}

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("renewals")
      .select("workflow_steps")
      .eq("id", id)
      .single()

    if (fetchErr) {
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 404 })
    }

    const update: Record<string, any> = { updated_at: new Date().toISOString() }

    if (typeof stepKey === "string") {
      const steps: WorkflowSteps = ((existing as any)?.workflow_steps as WorkflowSteps) || {}
      steps[stepKey] = done
        ? { done: true, at: new Date().toISOString(), by: by || null }
        : { done: false, at: null, by: null }
      update.workflow_steps = steps
    }
    if (typeof owner === "string") update.owner = owner
    if (typeof client_email === "string") update.client_email = client_email

    const { data, error } = await supabaseAdmin
      .from("renewals")
      .update(update)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, renewal: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update workflow" },
      { status: 500 },
    )
  }
}
