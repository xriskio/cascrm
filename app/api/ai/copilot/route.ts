export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getModel, getOpenAI, COPILOT_SYSTEM_PROMPT } from "@/lib/ai/openai"

type ChatMessage = { role: "user" | "assistant"; content: string }

/**
 * Builds a compact snapshot of the agency's current workflow so the Copilot
 * can answer grounded questions about THIS app's data.
 */
async function buildWorkflowContext(): Promise<string> {
  const today = new Date()
  const in60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
  const lines: string[] = []

  try {
    const [renewals, submissions, leads, tasks] = await Promise.all([
      supabaseAdmin
        .from("renewals")
        .select("client_name, named_insured, policy_number, carrier, premium, expiration_date, status")
        .neq("status", "archived")
        .order("expiration_date", { ascending: true })
        .limit(500),
      supabaseAdmin.from("submissions").select("status").limit(1000),
      supabaseAdmin.from("leads").select("status").limit(1000),
      supabaseAdmin.from("tasks").select("status").limit(1000),
    ])

    const rData: any[] = (renewals.data as any[]) || []
    const upcoming = rData.filter((r) => {
      if (!r.expiration_date) return false
      const d = new Date(r.expiration_date)
      return d >= today && d <= in60
    })
    lines.push(`Renewals: ${rData.length} active, ${upcoming.length} expiring in the next 60 days.`)
    if (upcoming.length) {
      lines.push("Soonest upcoming renewals:")
      upcoming.slice(0, 12).forEach((r) => {
        const name = r.client_name || r.named_insured || "Unknown"
        const exp = r.expiration_date ? new Date(r.expiration_date).toISOString().slice(0, 10) : "?"
        const prem = r.premium != null ? ` $${r.premium}` : ""
        lines.push(`- ${name} | ${r.policy_number || "no #"} | ${r.carrier || "carrier?"} | exp ${exp}${prem} | ${r.status || "pending"}`)
      })
    }

    const countBy = (rows: any[] | null) => {
      const m: Record<string, number> = {}
      ;(rows || []).forEach((x) => {
        const k = (x.status || "unknown").toString()
        m[k] = (m[k] || 0) + 1
      })
      return Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(", ") || "none"
    }
    lines.push(`Submissions by status: ${countBy(submissions.data as any[])}.`)
    lines.push(`Leads by status: ${countBy(leads.data as any[])}.`)
    lines.push(`Tasks by status: ${countBy(tasks.data as any[])}.`)
  } catch (err) {
    lines.push("(Workflow data could not be fully loaded.)")
  }

  return lines.join("\n")
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI()
  if (!openai) {
    return NextResponse.json(
      {
        error: "AI is not configured. Add OPENAI_API_KEY (and optionally OPENAI_MODEL) to enable the Copilot.",
      },
      { status: 503 },
    )
  }

  try {
    const body = await request.json()
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
    const cleaned = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)

    if (cleaned.length === 0) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 })
    }

    const context = await buildWorkflowContext()
    const todayStr = new Date().toISOString().slice(0, 10)

    const completion = await openai.chat.completions.create({
      model: getModel(),
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        { role: "system", content: COPILOT_SYSTEM_PROMPT },
        {
          role: "system",
          content: `Today's date is ${todayStr}.\n\nLIVE WORKFLOW CONTEXT (from this InsureTrac instance):\n${context}`,
        },
        ...cleaned.map((m) => ({ role: m.role, content: m.content })),
      ],
    })

    const reply = completion.choices?.[0]?.message?.content?.trim() || "I couldn't generate a response. Please try again."
    return NextResponse.json({ reply })
  } catch (error) {
    console.error("AI copilot error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed." },
      { status: 500 },
    )
  }
}
