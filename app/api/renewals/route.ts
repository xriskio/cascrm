import { type NextRequest, NextResponse } from "next/server"
import { requireApiPermission } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiPermission("read")
    if (!auth.authorized) return auth.response

    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const upcoming = searchParams.get("upcoming") === "true"
    const offset = (page - 1) * limit

    let query = supabase
      .from("renewals")
      .select("id, client_name, policy_number, expiration_date, status, created_at", { count: "exact" })

    // Filter for upcoming renewals (expiration_date in the future)
    if (upcoming) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte("expiration_date", today)
    }

    const {
      data: renewals,
      error,
      count,
    } = await query
      .range(offset, offset + limit - 1)
      .order("expiration_date", { ascending: true })

    if (error) {
      console.error("Error fetching renewals:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For dashboard, return data directly without pagination wrapper
    const isDashboard = searchParams.get("dashboard") === "true"
    if (isDashboard) {
      return NextResponse.json({ data: renewals })
    }

    return NextResponse.json({
      renewals,
      data: renewals,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiPermission("write")
    if (!auth.authorized) return auth.response

    const supabase = supabaseAdmin
    const body = await request.json()

    const { data: renewal, error } = await supabase.from("renewals").insert([body]).select("*, profiles(*)").single()

    if (error) {
      console.error("Error creating renewal:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ renewal }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
