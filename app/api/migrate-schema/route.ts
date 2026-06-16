import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST() {
  try {
    // Check if call_back_date column exists
    const { data: columns, error: checkError } = await supabaseAdmin
      .from('incoming_calls')
      .select('call_back_date')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({ 
        success: true, 
        message: "Schema already up to date - call_back_date column exists" 
      })
    }

    // Column doesn't exist, need to add it
    // Use RPC to execute SQL if available, or return instructions
    return NextResponse.json({
      success: false,
      message: "Column missing. Please run this SQL in your Supabase SQL Editor:",
      sql: `
-- Add missing call_back_date column if it doesn't exist
ALTER TABLE incoming_calls 
ADD COLUMN IF NOT EXISTS call_back_date DATE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
      `.trim()
    }, { status: 400 })

  } catch (error) {
    console.error("Migration check error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Migration check failed" 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
