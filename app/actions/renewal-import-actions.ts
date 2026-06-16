"use server"
import { handleAsyncError } from "@/lib/error-utils"

// Function to generate a renewal ID
function generateRenewalId() {
  const prefix = "RNW"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}

// Helper function to properly format dates
function formatDateForDatabase(dateValue: any): string | null {
  if (!dateValue) return null

  try {
    // Handle Excel date numbers (which are days since 1900-01-01)
    if (typeof dateValue === "number") {
      // Excel date serial number to JS date
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch)
      date.setDate(excelEpoch.getDate() + dateValue)
      return date.toISOString().split("T")[0] // YYYY-MM-DD format
    }

    // Handle string dates in various formats
    if (typeof dateValue === "string") {
      // Handle M/D/YYYY format (your format: 9/1/2024, 9/1/2025, etc.)
      const mdyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      const mdyyyyMatch = dateValue.trim().match(mdyyyy)
      if (mdyyyyMatch) {
        const [_, month, day, year] = mdyyyyMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Handle MM/DD/YYYY format
      const mmddyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const mmddyyyyMatch = dateValue.trim().match(mmddyyyy)
      if (mmddyyyyMatch) {
        const [_, month, day, year] = mmddyyyyMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Handle M-D-YYYY format
      const mdyyyyDash = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      const mdyyyyDashMatch = dateValue.trim().match(mdyyyyDash)
      if (mdyyyyDashMatch) {
        const [_, month, day, year] = mdyyyyDashMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Handle YYYY-MM-DD format (ISO)
      const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
      const yyyymmddMatch = dateValue.trim().match(yyyymmdd)
      if (yyyymmddMatch) {
        const [_, year, month, day] = yyyymmddMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Try to parse as a general date string
      const date = new Date(dateValue)
      if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
        return date.toISOString().split("T")[0]
      }
    }

    // Handle Date objects
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toISOString().split("T")[0]
      }
    }

    // If we get here, we couldn't parse the date
    console.error("Could not parse date:", dateValue, typeof dateValue)
    return null
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateValue)
    return null
  }
}

// Helper function to parse currency values
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

// Process Excel file
export async function processExcelFile(file: File) {
  try {
    // Mock implementation - replace with actual Excel processing
    const data = [
      {
        "Customer First Name": "John",
        "Customer Last Name": "Doe",
        "Expiration Date": "2024-12-31",
        "Writing Carrier": "ABC Insurance",
      },
    ]
    const headers = Object.keys(data[0])

    return {
      success: true,
      data,
      headers,
    }
  } catch (error) {
    return handleAsyncError(error)
  }
}

// Process CSV file
export async function processCsvFile(file: File) {
  try {
    // Mock implementation - replace with actual CSV processing
    const data = [
      {
        "Customer First Name": "John",
        "Customer Last Name": "Doe",
        "Expiration Date": "2024-12-31",
        "Writing Carrier": "ABC Insurance",
      },
    ]
    const headers = Object.keys(data[0])

    return {
      success: true,
      data,
      headers,
    }
  } catch (error) {
    return handleAsyncError(error)
  }
}

// Import renewals
export async function importRenewals(file: File, columnMappings: Record<string, string>, fileType: string) {
  try {
    // Mock implementation - replace with actual import logic
    const count = 10

    return {
      success: true,
      count,
      message: `Successfully imported ${count} renewals`,
    }
  } catch (error) {
    return handleAsyncError(error)
  }
}
