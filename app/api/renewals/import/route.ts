import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: "No file provided" 
      }, { status: 400 })
    }

    try {
      const text = await file.text()
      console.log("File content preview:", text.substring(0, 500))
      
      const renewals = parseRenewalCSV(text)
      console.log(`Parsed ${renewals.length} renewals from CSV`)

      if (renewals.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: "No valid renewals found in file. Please check the CSV format.",
          imported: 0,
          total: 0
        })
      }

      let totalImported = 0
      const errors: string[] = []

      for (const renewal of renewals) {
        try {
          const renewalNumber = `RNW-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
          
          const { error } = await supabase.from("renewals").insert({
            renewal_number: renewalNumber,
            renewal_id: renewalNumber,
            insured_name: renewal.insured_name,
            retail_agency_name: renewal.retail_agency_name || null,
            producer: renewal.producer || null,
            policy_type: renewal.policy_type || null,
            policy_number: renewal.policy_number || null,
            effective_date: renewal.effective_date || null,
            expiration_date: renewal.expiration_date,
            insurance_carrier: renewal.insurance_carrier,
            expiring_premium: renewal.expiring_premium || null,
            expiring_commission: renewal.expiring_commission || null,
            status: renewal.status || "pending",
            notes: renewal.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (error) {
            console.error("Database insert error:", error)
            errors.push(`Error importing renewal ${renewal.policy_number}: ${error.message}`)
          } else {
            totalImported++
          }
        } catch (error) {
          console.error("Processing error:", error)
          errors.push(`Error processing renewal: ${(error as Error).message}`)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Import completed`,
        imported: totalImported,
        total: renewals.length,
        errors: errors.length > 0 ? errors : undefined,
      })
    } catch (error) {
      console.error("File processing error:", error)
      return NextResponse.json({ 
        success: false,
        error: `Error processing file: ${(error as Error).message}` 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 })
  }
}

function parseRenewalCSV(text: string) {
  const lines = text.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const renewals = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < headers.length) continue

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    // Map CSV fields to database fields
    const firstName = row["Customer First Name"]?.trim() || ""
    const lastName = row["Customer Last Name"]?.trim() || ""
    const insuredName = `${firstName} ${lastName}`.trim() || "Unknown"
    
    const phone = row["Customer Primary Phone"]?.trim() || ""
    const email = row["Customer Primary Email"]?.trim() || ""
    const csr = row["CSR On Policy"]?.trim() || ""
    
    let notes = ""
    if (phone) notes += `Phone: ${phone}\n`
    if (email) notes += `Email: ${email}\n`
    if (csr) notes += `CSR: ${csr}`
    
    const premium = cleanCurrency(row["Policy Premium"])
    const commission = cleanCurrency(row["Agency Commission Total"])
    
    const status = mapStatus(row["Policy Status"])

    renewals.push({
      insured_name: insuredName,
      retail_agency_name: row["Location"]?.trim() || null,
      producer: row["Agent On Policy"]?.trim() || null,
      policy_type: row["Line of Business"]?.trim() || null,
      policy_number: row["Policy Number"]?.trim() || null,
      effective_date: parseDate(row["Effective Date"]),
      expiration_date: parseDate(row["Expiration Date"]) || new Date().toISOString().split('T')[0],
      insurance_carrier: row["Writing Carrier"]?.trim() || "Unknown",
      expiring_premium: premium,
      expiring_commission: commission,
      status: status,
      notes: notes.trim() || null,
    })
  }

  return renewals
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

function cleanCurrency(value: string): number | null {
  if (!value) return null
  const cleaned = value.replace(/[$,]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null
  
  try {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0')
      const day = parts[1].padStart(2, '0')
      const year = parts[2]
      return `${year}-${month}-${day}`
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error)
  }
  
  return null
}

function mapStatus(status: string): string {
  const statusLower = status?.toLowerCase() || ""
  
  if (statusLower.includes("active")) return "active"
  if (statusLower.includes("pending")) return "pending"
  if (statusLower.includes("completed")) return "completed"
  if (statusLower.includes("cancelled")) return "cancelled"
  
  return "pending"
}
