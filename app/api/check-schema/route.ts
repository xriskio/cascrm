import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    // Get the actual table structure from Supabase
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .limit(1)

    if (error) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details,
      })
    }

    // Return the structure
    return NextResponse.json({
      success: true,
      sampleRow: data?.[0] || null,
      columnNames: data?.[0] ? Object.keys(data[0]) : [],
      message: "Check the sampleRow to see the actual ID type in your database",
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
