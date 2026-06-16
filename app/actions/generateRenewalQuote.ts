"use server"

import { createClient } from "@/lib/supabase"
import { handleAsyncError } from "@/lib/error-utils"

const adminSupabase = createClient({ useServiceRole: true })

export async function generateRenewalQuote(renewalId: string, quoteData: any) {
  try {
    // Generate unique quote number
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const quoteNumber = `RQ-${timestamp}-${random}`

    // Update renewal with quote data
    const { data, error } = await adminSupabase
      .from("renewals")
      .update({
        quote_number: quoteNumber,
        quote_data: quoteData,
        quote_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", renewalId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      quoteNumber,
      data,
    }
  } catch (error) {
    return handleAsyncError(error)
  }
}
