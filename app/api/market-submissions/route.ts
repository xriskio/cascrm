import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.json()

    // Generate tracking number
    const trackingNumber = `MKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const marketSubmission = {
      tracking_number: trackingNumber,
      client_name: formData.clientName,
      policy_type: formData.policyType,
      market_name: formData.marketName || null,
      carrier_name: formData.carrierName || null,
      wholesaler_name: formData.wholesalerName,
      wholesaler_company: formData.wholesalerCompany || null,
      wholesaler_email: formData.wholesalerEmail || null,
      wholesaler_phone: formData.wholesalerPhone || null,
      submission_date: formData.submissionDate || null,
      response_date: formData.responseDate || null,
      quote_status: formData.quoteStatus || "pending",
      quote_amount: formData.quoteAmount ? parseFloat(formData.quoteAmount) : null,
      premium_quoted: formData.premiumQuoted || null,
      coverage_details: formData.coverageDetails || null,
      notes: formData.notes || null,
      decline_reason: formData.declineReason || null,
      priority: formData.priority || "normal",
      status: "active",
    }

    const { data, error } = await supabase
      .from("market_submissions")
      .insert(marketSubmission)
      .select()
      .single()

    if (error) {
      console.error("Error creating market submission:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("Error in market submission API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("market_submissions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching market submissions:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("Error in market submission API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
