import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    // Try to fetch from clients table
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      tableExists: true,
      sampleData: data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
