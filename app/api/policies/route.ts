import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const supabase = await createClient()

    const { data: policies, error } = await supabase
      .from("policies")
      .select(`
        *,
        clients (
          name,
          business_name,
          contact_name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(policies)
  } catch (error) {
    console.error("Error fetching policies:", error)
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: policy, error } = await supabase.from("policies").insert([body]).select().single()

    if (error) throw error

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error creating policy:", error)
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 })
  }
}
