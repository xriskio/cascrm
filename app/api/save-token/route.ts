export const dynamic = "force-dynamic"

export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from "next/server"
import { requireApiPermission } from "@/lib/api-auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiPermission("delete")
    if (!auth.authorized) return auth.response

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Clear existing tokens
    await supabase.from("qqcatalyst_tokens").delete().neq("id", "dummy")

    // Save the new token
    const { error } = await supabase.from("qqcatalyst_tokens").insert({
      id: "working-token",
      access_token: token,
      token_name: "Working QQ Token",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving token:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Token saved successfully",
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to save token" }, { status: 500 })
  }
}
