import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { renewalId: string } }) {
  try {
    const supabase = supabaseAdmin
    const { renewalId } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(renewalId)) {
      return NextResponse.json({ error: "Invalid renewal ID format" }, { status: 400 })
    }

    const { data: renewal, error } = await supabase
      .from("renewals")
      .select("*, profiles(*)")
      .eq("id", renewalId)
      .single()

    if (error) {
      console.error("Error fetching renewal:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!renewal) {
      return NextResponse.json({ error: "Renewal not found" }, { status: 404 })
    }

    return NextResponse.json({ renewal })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { renewalId: string } }) {
  try {
    const supabase = supabaseAdmin
    const { renewalId } = params
    const body = await request.json()

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(renewalId)) {
      return NextResponse.json({ error: "Invalid renewal ID format" }, { status: 400 })
    }

    const { data: renewal, error } = await supabase
      .from("renewals")
      .update(body)
      .eq("id", renewalId)
      .select("*, profiles(*)")
      .single()

    if (error) {
      console.error("Error updating renewal:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ renewal })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { renewalId: string } }) {
  try {
    const supabase = supabaseAdmin
    const { renewalId } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(renewalId)) {
      return NextResponse.json({ error: "Invalid renewal ID format" }, { status: 400 })
    }

    const { error } = await supabase.from("renewals").delete().eq("id", renewalId)

    if (error) {
      console.error("Error deleting renewal:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Renewal deleted successfully" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
