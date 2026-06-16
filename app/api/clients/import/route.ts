import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Helper function to safely parse dates
function safeParseDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null

  try {
    // Try to parse the date string
    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.log(`Invalid date: ${dateString}`)
      return null
    }

    return date.toISOString()
  } catch (error) {
    console.log(`Error parsing date ${dateString}:`, error)
    return null
  }
}

// Helper function to safely parse numbers
function safeParseNumber(value: string | null | undefined): number | null {
  if (!value) return null

  const num = Number(value)
  return isNaN(num) ? null : num
}

// Helper function to generate a unique client number
async function generateUniqueClientNumber(supabase: any, baseNumber?: string): Promise<string> {
  let clientNumber = baseNumber || `CL${Date.now()}${Math.floor(Math.random() * 1000)}`
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Check if this client number already exists
    const { data: existing } = await supabase
      .from("clients")
      .select("client_number")
      .eq("client_number", clientNumber)
      .single()

    if (!existing) {
      // Client number is unique, return it
      return clientNumber
    }

    // Generate a new number
    attempts++
    clientNumber = `CL${Date.now()}${Math.floor(Math.random() * 10000)}_${attempts}`
  }

  // If we still can't find a unique number, use timestamp + random
  return `CL${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { clients } = await request.json()

    console.log(`Starting bulk import of ${clients.length} clients`)

    const results = {
      success: 0,
      errors: 0,
      skipped: 0,
      total: clients.length,
      errorDetails: [] as string[],
      skippedDetails: [] as string[],
    }

    // Process in chunks of 1000 to avoid rate limits
    const chunkSize = 1000

    for (let i = 0; i < clients.length; i += chunkSize) {
      const batch = clients.slice(i, i + chunkSize)
      console.log(`Processing batch ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(clients.length / chunkSize)}`)

      try {
        // Prepare batch data
        const batchData = []
        const batchErrors = []

        for (let j = 0; j < batch.length; j++) {
          const clientData = batch[j]
          const rowIndex = i + j + 1

          try {
            // Skip if no name or account name
            if (!clientData.account_name && !clientData.name) {
              results.skipped++
              results.skippedDetails.push(`Row ${rowIndex}: No name provided`)
              continue
            }

            // Generate unique client number
            const baseClientNumber = clientData.uid || `CL${Date.now()}${rowIndex}`
            const uniqueClientNumber = await generateUniqueClientNumber(supabase, baseClientNumber)

            // Build client object with ONLY existing columns
            const clientToInsert: Record<string, any> = {
              // Required fields
              name: clientData.account_name || clientData.name,
              client_number: uniqueClientNumber,

              // Contact information (existing columns only)
              contact_name: clientData.contact_name,
              phone: clientData.phone,
              email: clientData.email,
              secondary_phone: clientData.secondary_phone,

              // Address - map to single address field
              address: [
                clientData.street_address,
                clientData.street_address_line_2,
                clientData.city,
                clientData.state,
                clientData.zip,
                clientData.country,
              ]
                .filter(Boolean)
                .join(", "),

              zip: clientData.zip,

              // Agency and policy information
              agency_name: clientData.business_name || clientData.agency_name,
              policy_type: clientData.policy_type,
              policy_number: clientData.policy_number,
              carrier: clientData.carrier,

              // Financial information
              premium: safeParseNumber(clientData.premium),
              broker_fee: safeParseNumber(clientData.broker_fee),
              prior_premium: safeParseNumber(clientData.prior_premium),

              // Staff assignments
              csr: clientData.csr,
              producer: clientData.producer,

              // Dates
              effective_date: safeParseDate(clientData.effective_date),
              expiration_date: safeParseDate(clientData.expiration_date),

              // System fields
              uid: clientData.uid,
              created_at: new Date().toISOString(),
            }

            // Remove null/undefined/empty values
            Object.keys(clientToInsert).forEach((key) => {
              if (clientToInsert[key] === null || clientToInsert[key] === undefined || clientToInsert[key] === "") {
                delete clientToInsert[key]
              }
            })

            batchData.push(clientToInsert)
          } catch (error: any) {
            batchErrors.push(`Row ${rowIndex}: ${error.message}`)
          }
        }

        // Bulk insert the batch
        if (batchData.length > 0) {
          const { data, error } = await supabase.from("clients").insert(batchData).select()

          if (error) {
            console.error(`Batch insert error:`, error)
            // Add all batch items to errors
            batchData.forEach((_, index) => {
              results.errors++
              results.errorDetails.push(`Batch ${Math.floor(i / chunkSize) + 1}, Row ${index + 1}: ${error.message}`)
            })
          } else {
            results.success += batchData.length
            console.log(`Successfully inserted batch of ${batchData.length} clients`)
          }
        }

        // Add individual row errors to results
        batchErrors.forEach((error) => {
          results.errors++
          results.errorDetails.push(error)
        })
      } catch (batchError: any) {
        console.error(`Batch processing error:`, batchError)
        // Mark entire batch as failed
        batch.forEach((_, index) => {
          results.errors++
          results.errorDetails.push(`Batch ${Math.floor(i / chunkSize) + 1}, Row ${index + 1}: ${batchError.message}`)
        })
      }

      // Add small delay between batches to avoid overwhelming the database
      if (i + chunkSize < clients.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    console.log("Bulk import completed:", results)
    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Import error:", error)
    return NextResponse.json(
      {
        error: "Import failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
