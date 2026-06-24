export const dynamic = "force-dynamic"
export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { requireApiPermission } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST() {
  try {
    const auth = await requireApiPermission("delete")
    if (!auth.authorized) return auth.response

    console.log("🗑️ Clearing ALL renewals from database...")

    // Delete all renewals
    const { data, error } = await supabaseAdmin
      .from("renewals")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all rows
      .select()

    if (error) {
      console.error("❌ Error deleting renewals:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    const deletedCount = data?.length || 0
    console.log(`✅ Deleted ${deletedCount} renewals`)

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      message: `Successfully deleted all ${deletedCount} renewals`,
    })
  } catch (error) {
    console.error("❌ Failed to clear renewals:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
