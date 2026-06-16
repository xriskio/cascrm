import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { renewalId: string } }
) {
  try {
    const { renewalId } = params
    const { email, sent_at } = await request.json()

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(renewalId)) {
      return NextResponse.json({ error: "Invalid renewal ID format" }, { status: 400 })
    }

    // Update the renewal record to log the email send
    const { data, error } = await supabaseAdmin
      .from("renewals")
      .update({
        date_sent_to_insured: new Date(sent_at || Date.now()).toISOString().split('T')[0],
        status: 'sent_to_insured',
      })
      .eq("id", renewalId)
      .select()
      .single()

    if (error) {
      console.error("Error logging email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`📧 Email logged for renewal ${renewalId} sent to ${email}`)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
