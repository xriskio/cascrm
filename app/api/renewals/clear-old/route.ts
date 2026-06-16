export const dynamic = "force-dynamic"
export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST() {
  try {
    console.log("🗑️ Clearing old renewals (expired before today)...")

    const today = new Date().toISOString()

    // Delete all renewals with expiration dates before today
    const { data, error } = await supabaseAdmin
      .from("renewals")
      .delete()
      .lt("expiration_date", today)
      .select()

    if (error) {
      console.error("❌ Error deleting old renewals:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    const deletedCount = data?.length || 0
    console.log(`✅ Deleted ${deletedCount} old/expired renewals`)

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      message: `Successfully deleted ${deletedCount} old/expired renewals`,
    })
  } catch (error) {
    console.error("❌ Failed to clear old renewals:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
