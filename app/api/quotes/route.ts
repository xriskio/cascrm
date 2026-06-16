import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const supabase = await createClient()

    const { data: quotes, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching quotes:", error)
      return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 })
    }

    return NextResponse.json(quotes)
  } catch (error) {
    console.error("Error in quotes API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Try to get the current user, but don't fail if not authenticated (development mode)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // In development mode, create a default user ID if no auth
    const userId = user?.id || "00000000-0000-0000-0000-000000000000"

    console.log("Creating quote with user ID:", userId)

    const data = await request.json()

    // Generate quote number
    const quoteNumber = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const quoteData = {
      quote_number: quoteNumber,
      submission_type: data.submissionType,
      insurance_type: data.insuranceType,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      insured_name: data.insuredName,
      insured_address: data.insuredAddress,
      follow_up_2_date: data.followUp2Date || null,
      follow_up_final_date: data.finalFollowUpDate || null,
      disposition_status: data.dispositionStatus || "pending",
      total_premium: data.totalPremium ? Number.parseFloat(data.totalPremium) : null,
      total_monthly_payment: data.monthlyPayment ? Number.parseFloat(data.monthlyPayment) : null,
      total_down_payment: data.downPayment ? Number.parseFloat(data.downPayment) : null,
      number_of_installments: data.numberOfInstallments ? Number.parseInt(data.numberOfInstallments) : null,
      notes: data.notes,
      quote_status: "draft",
      carriers: data.carriers || [],
      coverages: data.coverages || [],
      exclusions: data.exclusions || "",
      user_id: userId,
      created_by: userId,
      date_created: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: quote, error } = await supabase.from("quotes").insert([quoteData]).select().single()

    if (error) {
      console.error("Error creating quote:", error)
      return NextResponse.json(
        {
          error: "Failed to create quote",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error("Error in quotes POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
