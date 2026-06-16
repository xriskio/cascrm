import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { quotes } = await request.json()

    if (!quotes || !Array.isArray(quotes)) {
      return NextResponse.json({ error: "Invalid quotes data" }, { status: 400 })
    }

    const results = {
      imported: 0,
      errors: [] as string[],
    }

    for (const [index, quote] of quotes.entries()) {
      try {
        // Validate required fields
        if (!quote.quote_number) {
          quote.quote_number = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        }

        // Convert numeric fields
        if (quote.total_premium) {
          quote.total_premium = Number.parseFloat(quote.total_premium.toString().replace(/[,$]/g, ""))
        }
        if (quote.total_monthly_payment) {
          quote.total_monthly_payment = Number.parseFloat(quote.total_monthly_payment.toString().replace(/[,$]/g, ""))
        }
        if (quote.total_down_payment) {
          quote.total_down_payment = Number.parseFloat(quote.total_down_payment.toString().replace(/[,$]/g, ""))
        }
        if (quote.number_of_installments) {
          quote.number_of_installments = Number.parseInt(quote.number_of_installments.toString())
        }

        // Set default values
        quote.quote_status = quote.quote_status || "draft"
        quote.disposition_status = quote.disposition_status || "pending"
        quote.date_created = quote.date_created || new Date().toISOString()
        quote.created_at = new Date().toISOString()
        quote.updated_at = new Date().toISOString()

        const { error } = await supabase.from("quotes").insert([quote])

        if (error) {
          if (error.code === "23505") {
            // Duplicate quote number
            results.errors.push(`Row ${index + 1}: Quote number ${quote.quote_number} already exists`)
          } else {
            results.errors.push(`Row ${index + 1}: ${error.message}`)
          }
        } else {
          results.imported++
        }
      } catch (error) {
        results.errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in quotes import API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
