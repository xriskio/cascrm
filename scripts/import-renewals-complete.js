import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with admin privileges to bypass RLS
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nybxlheqpgktxpwkuigg.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55YnhsaGVxcGdrdHhwd2t1aWdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzExNjExMiwiZXhwIjoyMDYyNjkyMTEyfQ.UWQr3HeAOg-oypBqJMgfmN1w-HTdoH6o3bVUvVuWkjw"

console.log("Using Supabase URL:", supabaseUrl)
console.log("Using Service Key:", supabaseServiceKey ? "✓ Found" : "✗ Missing")

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  console.log("SUPABASE_URL:", supabaseUrl)
  console.log("SERVICE_KEY:", supabaseServiceKey ? "Present" : "Missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fetchCSV(url) {
  try {
    console.log(`Fetching CSV from: ${url}`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    console.log(`CSV fetched successfully. Size: ${text.length} characters`)
    console.log("First 500 characters:", text.substring(0, 500))
    return text
  } catch (error) {
    console.error("Error fetching CSV:", error)
    throw error
  }
}

function parseCSV(csvText) {
  const lines = csvText.split("\n").filter((line) => line.trim())
  console.log(`Total lines in CSV: ${lines.length}`)

  if (lines.length === 0) {
    throw new Error("CSV file is empty")
  }

  const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))
  console.log("CSV Headers:", headers)

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    // Handle commas within quoted fields
    const row = []
    let inQuotes = false
    let currentValue = ""

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        row.push(currentValue.trim().replace(/"/g, ""))
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    row.push(currentValue.trim().replace(/"/g, ""))

    const rowObj = {}
    headers.forEach((header, index) => {
      if (index < row.length) {
        rowObj[header] = row[index]
      }
    })

    rows.push(rowObj)
  }

  console.log(`Parsed ${rows.length} rows from CSV`)
  console.log("Sample row:", rows[0])
  return rows
}

function generateRenewalId() {
  const prefix = "RNW"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}

function generateTrackingNumber() {
  const prefix = "TRK"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}

function parseDate(dateString) {
  if (!dateString) return null

  try {
    // Handle M/D/YYYY format (9/1/2024, 9/1/2025, etc.)
    const mdyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    const match = dateString.trim().match(mdyyyy)
    if (match) {
      const [_, month, day, year] = match
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0] // Return YYYY-MM-DD format
      }
    }

    // Fallback to general date parsing
    const date = new Date(dateString)
    if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
      return date.toISOString().split("T")[0]
    }

    console.warn(`Could not parse date: ${dateString}`)
    return null
  } catch (error) {
    console.warn(`Error parsing date ${dateString}:`, error)
    return null
  }
}

function parseCurrency(value) {
  if (!value) return null
  if (typeof value === "number") return value

  if (typeof value === "string") {
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[$,\s]/g, "")
    const parsed = Number.parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }

  return null
}

function mapRenewalData(csvData) {
  console.log("Mapping renewal data...")

  return csvData.map((row, index) => {
    const renewal = {
      // Generate required fields that your app expects
      renewal_id: generateRenewalId(),
      tracking_number: generateTrackingNumber(),
      date_entered: new Date().toISOString().split("T")[0],
      status: "pending",
      policy_status: row["Policy Status"] || "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived: false,

      // Map CSV columns to the exact database columns your app uses
      business_name: `${row["Customer First Name"] || ""} ${row["Customer Last Name"] || ""}`.trim(),
      insured_name: `${row["Customer First Name"] || ""} ${row["Customer Last Name"] || ""}`.trim(),
      client_name: `${row["Customer First Name"] || ""} ${row["Customer Last Name"] || ""}`.trim(),

      location: row["Location"] || null,
      customer_first_name: row["Customer First Name"] || null,
      customer_last_name: row["Customer Last Name"] || null,
      customer_primary_phone: row["Customer Primary Phone"] || null,
      customer_primary_email: row["Customer Primary Email"] || null,

      policy_number: row["Policy Number"] || null,
      line_of_business: row["Line of Business"] || null,
      policy_type: row["Line of Business"] || null,

      writing_carrier: row["Writing Carrier"] || null,
      insurance_carrier: row["Writing Carrier"] || null,
      carrier: row["Writing Carrier"] || null,

      csr_on_policy: row["CSR On Policy"] || null,
      csr: row["CSR On Policy"] || null,

      agent_on_policy: row["Agent On Policy"] || null,
      producer: row["Agent On Policy"] || null,

      // Parse dates properly
      effective_date: parseDate(row["Effective Date"]),
      expiration_date: parseDate(row["Expiration Date"]),

      // Parse financial data
      policy_premium: parseCurrency(row["Policy Premium"]),
      expiring_premium: parseCurrency(row["Policy Premium"]),
      premium: parseCurrency(row["Policy Premium"]),

      agency_commission_total: parseCurrency(row["Agency Commission Total"]),
      expiring_commission: parseCurrency(row["Agency Commission Total"]),
      broker_fee: parseCurrency(row["Agency Commission Total"]),

      // Contact information
      email: row["Customer Primary Email"] || null,
      phone: row["Customer Primary Phone"] || null,
      client_email: row["Customer Primary Email"] || null,
      client_phone: row["Customer Primary Phone"] || null,

      // Additional fields your app might need
      agency_name: row["Location"] || null,
      contact_name: `${row["Customer First Name"] || ""} ${row["Customer Last Name"] || ""}`.trim(),

      // Set defaults for other fields
      quote_version: 1,
      remarketing_requested: false,
      remarketing_companies: [],
    }

    // Remove null/undefined/empty values to avoid database issues
    Object.keys(renewal).forEach((key) => {
      if (renewal[key] === null || renewal[key] === undefined || renewal[key] === "") {
        delete renewal[key]
      }
    })

    if (index < 3) {
      console.log(`Sample mapped renewal ${index + 1}:`, renewal)
    }

    return renewal
  })
}

async function insertRenewals(renewals) {
  console.log(`Starting to insert ${renewals.length} renewals into database`)

  // Insert in smaller batches to avoid issues
  const batchSize = 25
  let totalInserted = 0
  const errors = []

  for (let i = 0; i < renewals.length; i += batchSize) {
    const batch = renewals.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(renewals.length / batchSize)

    console.log(`Processing batch ${batchNumber} of ${totalBatches} (${batch.length} records)`)

    try {
      const { data, error } = await supabase.from("renewals").insert(batch).select()

      if (error) {
        console.error(`Error inserting batch ${batchNumber}:`, error)
        errors.push(`Batch ${batchNumber}: ${error.message}`)
      } else {
        const insertedCount = data?.length || 0
        totalInserted += insertedCount
        console.log(`✓ Successfully inserted batch ${batchNumber}: ${insertedCount} records`)
      }
    } catch (error) {
      console.error(`Exception in batch ${batchNumber}:`, error)
      errors.push(`Batch ${batchNumber}: ${error.message}`)
    }

    // Small delay between batches
    if (i + batchSize < renewals.length) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  return { totalInserted, errors }
}

async function verifyInsert() {
  console.log("Verifying data was inserted...")

  try {
    const { data, error } = await supabase.from("renewals").select("count(*)").single()

    if (error) {
      console.error("Error verifying data:", error)
      return null
    }

    console.log("Total renewals in database:", data.count)
    return data.count
  } catch (error) {
    console.error("Exception verifying data:", error)
    return null
  }
}

async function main() {
  try {
    console.log("=== Starting Renewal Import Process ===")

    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Renewal%20Report-rYVZbQXT4nGDnCgIMjik12PKkBvLyR.csv"

    // Step 1: Fetch CSV
    const csvText = await fetchCSV(csvUrl)

    // Step 2: Parse CSV
    const csvData = parseCSV(csvText)

    // Step 3: Map data to renewal format
    const renewals = mapRenewalData(csvData)

    // Step 4: Insert renewals
    const { totalInserted, errors } = await insertRenewals(renewals)

    // Step 5: Verify insertion
    const totalCount = await verifyInsert()

    // Step 6: Report results
    console.log("\n=== Import Results ===")
    console.log(`Total records processed: ${renewals.length}`)
    console.log(`Successfully inserted: ${totalInserted}`)
    console.log(`Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log("\nErrors encountered:")
      errors.forEach((error) => console.log(`- ${error}`))
    }

    if (totalCount !== null) {
      console.log(`\nTotal renewals now in database: ${totalCount}`)
    }

    console.log("\n=== Import Complete ===")
  } catch (error) {
    console.error("Main execution error:", error)
  }
}

// Run the import
main()
