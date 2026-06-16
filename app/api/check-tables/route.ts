import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    // Try to query the clients table structure
    const { data: tables, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .limit(0)
    
    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          exists: false,
          error: "clients table does not exist",
          message: "You need to run /fix-database to create the table"
        })
      }
      
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      })
    }
    
    return NextResponse.json({
      success: true,
      exists: true,
      message: "clients table exists in Supabase"
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
