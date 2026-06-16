import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get("table") || "contacts"

    const supabase = await createClient()

    // Get count
    const { count, error: countError } = await supabase.from(table).select("*", { count: "exact", head: true })

    if (countError) {
      return NextResponse.json({ error: countError.message, count: 0 })
    }

    // Get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from(table)
      .select("*")
      .limit(5)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      table,
      count: count || 0,
      sample: sampleData || [],
      error: sampleError?.message || null,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
