import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check clients table
    const { data: clients, error, count } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: false })
      .limit(5)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      })
    }
    
    return NextResponse.json({
      success: true,
      count,
      sample: clients,
      database: "Supabase"
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
