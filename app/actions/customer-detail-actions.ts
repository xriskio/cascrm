"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchCustomerDetailSummary } from "@/lib/qqcatalyst/api"

export async function getCustomerDetailSummary(customerId: string) {
  try {
    // First check if we have this data in the database
    const supabase = await createClient()
    const { data: existingData, error: dbError } = await supabase
      .from("customer_details")
      .select("*")
      .eq("customer_id", customerId)
      .single()

    if (existingData) {
      return {
        success: true,
        data: existingData.details,
        source: "database",
      }
    }

    // If not in database, try to fetch from QQCatalyst API
    try {
      const details = await fetchCustomerDetailSummary(customerId)

      // Store in database for future use
      if (details) {
        await supabase.from("customer_details").upsert({
          customer_id: customerId,
          details: details,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      return {
        success: true,
        data: details,
        source: "api",
      }
    } catch (apiError) {
      console.error("Error fetching customer details from API:", apiError)

      // Return a graceful error
      return {
        success: false,
        error: "Failed to fetch customer details from QQCatalyst API",
        source: "api_error",
      }
    }
  } catch (error) {
    console.error("Error in getCustomerDetailSummary:", error)
    return {
      success: false,
      error: "Failed to get customer details",
    }
  }
}

export async function storeCustomerDetails(customerId: string, details: any) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("customer_details").upsert({
      customer_id: customerId,
      details: details,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error storing customer details:", error)
    return {
      success: false,
      error: "Failed to store customer details",
    }
  }
}
