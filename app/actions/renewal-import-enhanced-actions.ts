"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchExpiringPolicies } from "@/app/actions/qqcatalyst-actions"
import { generateRenewalId } from "@/utils/renewal-utils"
import { formatDateForDatabase } from "@/utils/date-utils"
import { extractErrorMessage } from "@/lib/error-utils"

export async function importRenewalsFromQQ(params: {
  startDate: string
  endDate: string
  fieldMappings: Record<string, string>
  maxRecords?: number
}) {
  try {
    const { startDate, endDate, fieldMappings, maxRecords = 1000 } = params

    console.log("Starting QQ renewal import with field mappings:", fieldMappings)

    // Fetch data from QQCatalyst
    const qqData = await fetchExpiringPolicies({
      startDate,
      endDate,
      maxRecords,
    })

    if (!qqData.success || !qqData.data) {
      return {
        success: false,
        error: qqData.error || "Failed to fetch data from QQCatalyst",
      }
    }

    const supabase = await createClient()
    let importedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each record with field mapping
    for (const qqRecord of qqData.data) {
      try {
        // Map QQ fields to renewal fields
        const mappedRecord: any = {
          renewal_id: generateRenewalId(),
          date_entered: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Apply field mappings
        Object.entries(fieldMappings).forEach(([qqField, renewalField]) => {
          if (qqField in qqRecord && renewalField) {
            let value = qqRecord[qqField]

            // Handle date fields
            if (renewalField.includes("date") && value) {
              value = formatDateForDatabase(value)
            }

            // Handle currency fields
            if (renewalField.includes("premium") || renewalField.includes("commission")) {
              value = parseCurrency(value)
            }

            mappedRecord[renewalField] = value
          }
        })

        // Ensure required fields have values
        if (!mappedRecord.insured_name && !mappedRecord.client_name) {
          mappedRecord.insured_name = "Unknown Client"
        }

        if (!mappedRecord.expiration_date) {
          errors.push(`Skipping record: Missing expiration date`)
          errorCount++
          continue
        }

        // Store raw QQ data for reference
        mappedRecord.qq_raw_data = qqRecord

        // Insert into database
        const { error } = await supabase.from("renewals_enhanced").upsert(mappedRecord, {
          onConflict: "policy_number",
          ignoreDuplicates: false,
        })

        if (error) {
          console.error("Database insert error:", error)
          errors.push(`Database error: ${error.message}`)
          errorCount++
        } else {
          importedCount++
        }
      } catch (recordError) {
        console.error("Error processing record:", recordError)
        errors.push(`Record processing error: ${(recordError as any).message}`)
        errorCount++
      }
    }

    return {
      success: true,
      importedCount,
      errorCount,
      totalRecords: qqData.data.length,
      errors: errors.slice(0, 10), // Return first 10 errors
      fieldMappings,
    }
  } catch (error) {
    console.error("Import error:", error)
    return {
      success: false,
      error: extractErrorMessage(error),
    }
  }
}

function parseCurrency(value: any): number {
  if (!value) return 0
  if (typeof value === "number") return value

  if (typeof value === "string") {
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[$,\s]/g, "")
    const parsed = Number.parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  return 0
}
