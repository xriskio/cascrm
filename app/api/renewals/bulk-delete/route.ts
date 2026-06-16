import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { renewalIds } = await request.json()

    if (!Array.isArray(renewalIds) || renewalIds.length === 0) {
      return NextResponse.json({ error: "Invalid renewal IDs provided" }, { status: 400 })
    }

    // Validate all UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const invalidIds = renewalIds.filter((id) => !uuidRegex.test(id))

    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid UUID format for renewal IDs",
          invalidIds,
        },
        { status: 400 },
      )
    }

    const { data, error } = await supabase.from("renewals").delete().in("id", renewalIds).select("id")

    if (error) {
      console.error("Error bulk deleting renewals:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully deleted ${data?.length || 0} renewals`,
      deletedIds: data?.map((item) => item.id) || [],
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
