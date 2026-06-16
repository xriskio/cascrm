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
    return text
  } catch (error) {
    console.error("Error fetching CSV:", error)
    throw error
  }
}

function parseCSV(csvText) {
  const lines = csvText.split("\n")
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
  return rows
}

function mapRenewalData(csvData) {
  return csvData.map((row) => {
    // Parse dates
    let effectiveDate = null
    let expirationDate = null

    if (row["Effective Date"]) {
      try {
        const dateParts = row["Effective Date"].split("/")
        if (dateParts.length === 3) {
          effectiveDate = new Date(
            Number.parseInt(dateParts[2]),
            Number.parseInt(dateParts[0]) - 1,
            Number.parseInt(dateParts[1]),
          ).toISOString()
        }
      } catch (e) {
        console.warn(`Invalid effective date format: ${row["Effective Date"]}`)
      }
    }

    if (row["Expiration Date"]) {
      try {
        const dateParts = row["Expiration Date"].split("/")
        if (dateParts.length === 3) {
          expirationDate = new Date(
            Number.parseInt(dateParts[2]),
            Number.parseInt(dateParts[0]) - 1,
            Number.parseInt(dateParts[1]),
          ).toISOString()
        }
      } catch (e) {
        console.warn(`Invalid expiration date format: ${row["Expiration Date"]}`)
      }
    }

    // Parse premium (remove $ and commas)
    let premium = null
    if (row["Policy Premium"]) {
      premium = Number.parseFloat(row["Policy Premium"].replace(/[$,]/g, "")) || null
    }

    // Parse commission (remove $ and commas)
    let brokerFee = null
    if (row["Agency Commission Total"]) {
      brokerFee = Number.parseFloat(row["Agency Commission Total"].replace(/[$,]/g, "")) || null
    }

    // Map to actual renewals table columns
    return {
      name: `${row["Customer First Name"] || ""} ${row["Customer Last Name"] || ""}`.trim(),
      contact_name: `${row["Customer First Name"] || ""} ${row["Customer Last Name"] || ""}`.trim(),
      email: row["Customer Primary Email"] || null,
      phone: row["Customer Primary Phone"] || null,
      policy_number: row["Policy Number"] || null,
      effective_date: effectiveDate,
      expiration_date: expirationDate,
      policy_type: row["Line of Business"] || null,
      carrier: row["Writing Carrier"] || null,
      premium: premium,
      broker_fee: brokerFee,
      csr: row["CSR On Policy"] || null,
      producer: row["Agent On Policy"] || null,
      agency_name: row["Location"] || null,
      created_at: new Date().toISOString(),
    }
  })
}

async function insertRenewals(renewals) {
  console.log(`Inserting ${renewals.length} renewals into database`)

  // Insert in batches to avoid potential issues with large datasets
  const batchSize = 50
  const results = []

  for (let i = 0; i < renewals.length; i += batchSize) {
    const batch = renewals.slice(i, i + batchSize)
    console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(renewals.length / batchSize)}`)

    try {
      const { data, error } = await supabase.from("renewals").insert(batch).select()

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Successfully inserted batch ${i / batchSize + 1}, count: ${data.length}`)
        results.push(...data)
      }
    } catch (error) {
      console.error(`Exception in batch ${i / batchSize + 1}:`, error)
    }
  }

  return results
}

async function main() {
  try {
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Renewal%20Report-rYVZbQXT4nGDnCgIMjik12PKkBvLyR.csv"
    const csvText = await fetchCSV(csvUrl)
    const csvData = parseCSV(csvText)

    console.log("Sample row from CSV:", csvData[0])

    const renewals = mapRenewalData(csvData)
    console.log("Sample mapped renewal:", renewals[0])

    const insertedRenewals = await insertRenewals(renewals)
    console.log(`Successfully inserted ${insertedRenewals.length} renewals`)

    // Verify the data was inserted
    const { data: verifyData, error: verifyError } = await supabase.from("renewals").select("count(*)").single()

    if (verifyError) {
      console.error("Error verifying data:", verifyError)
    } else {
      console.log("Total renewals in database:", verifyData.count)
    }
  } catch (error) {
    console.error("Main execution error:", error)
  }
}

main()
