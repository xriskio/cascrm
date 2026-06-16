import { createClient } from "@supabase/supabase-js"

const QQ_API_URL = process.env.QQCATALYST_API_URL!
const QQ_BEARER_TOKEN = process.env.QQCATALYST_BEARER_TOKEN!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fetchContacts(pageNumber: number = 1) {
  const params = new URLSearchParams({
    startDate: "2014-06-01",
    endDate: "2025-12-31",
    pageNumber: pageNumber.toString(),
    pageSize: "500",
  })
  
  const url = `${QQ_API_URL}/Contacts/LastModifiedCreated?${params}`
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${QQ_BEARER_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`QQ API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchPolicies(pageNumber: number = 1) {
  const params = new URLSearchParams({
    startDate: "2017-01-01",
    endDate: "2025-12-31",
    pageNumber: pageNumber.toString(),
    pageSize: "500",
  })
  
  const url = `${QQ_API_URL}/Policies/LastModifiedCreated?${params}`
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${QQ_BEARER_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`QQ API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function main() {
  console.log("🚀 Starting QQCatalyst import...")

  // Fetch contacts
  console.log("📥 Fetching contacts...")
  const allContacts: any[] = []
  for (let page = 1; page <= 5; page++) {
    const response = await fetchContacts(page)
    if (!response?.Data || response.Data.length === 0) break
    allContacts.push(...response.Data)
    console.log(`   Page ${page}: ${response.Data.length} contacts (Total: ${response.TotalItems})`)
    if (response.PageNumber >= response.PagesTotal) break
  }
  console.log(`✅ Total contacts: ${allContacts.length}`)

  // Fetch policies
  console.log("\n📥 Fetching policies...")
  const allPolicies: any[] = []
  for (let page = 1; page <= 5; page++) {
    const response = await fetchPolicies(page)
    if (!response?.Data || response.Data.length === 0) break
    allPolicies.push(...response.Data)
    console.log(`   Page ${page}: ${response.Data.length} policies (Total: ${response.TotalItems})`)
    if (response.PageNumber >= response.PagesTotal) break
  }
  console.log(`✅ Total policies: ${allPolicies.length}`)

  // Group policies by CustomerID
  console.log("\n🔄 Processing data...")
  const policiesByCustomer = new Map<string, any[]>()
  for (const policy of allPolicies) {
    const customerId = policy.CustomerID || policy.PolicyID
    if (!policiesByCustomer.has(customerId)) {
      policiesByCustomer.set(customerId, [])
    }
    policiesByCustomer.get(customerId)!.push(policy)
  }

  // Process each contact
  const clientRecords = []
  for (const contact of allContacts) {
    const customerId = contact.CustomerID || contact.ContactID
    const contactPolicies = policiesByCustomer.get(customerId) || []

    // Calculate metrics
    let totalPremium = 0
    let earliestRenewal: string | null = null

    for (const policy of contactPolicies) {
      const premium = parseFloat(String(policy.Premium || policy.TotalPremium || 0))
      totalPremium += premium || 0

      if (policy.RenewalDate) {
        if (!earliestRenewal || new Date(policy.RenewalDate) < new Date(earliestRenewal)) {
          earliestRenewal = policy.RenewalDate
        }
      }
    }

    clientRecords.push({
      qq_contact_id: contact.ContactID,
      customer_id: contact.CustomerID || null,
      entity_id: contact.EntityID || null,
      contact_name: contact.ContactName || null,
      first_name: contact.FirstName || null,
      last_name: contact.LastName || null,
      name: contact.Name || contact.ContactName || null,
      business_name: contact.BusinessName || null,
      email: contact.Email || null,
      phone: contact.Phone || null,
      address: contact.Address || null,
      city: contact.City || null,
      state: contact.State || null,
      zip: contact.Zip || contact.ZipCode || null,
      zip_code: contact.ZipCode || contact.Zip || null,
      policy_count: contactPolicies.length,
      total_premium: totalPremium.toFixed(2),
      renewal_date: earliestRenewal,
      status: "active",
      json_raw: {
        contact: contact,
        policies: contactPolicies,
      },
    })
  }

  console.log(`✅ Prepared ${clientRecords.length} client records`)

  // Insert using Supabase
  console.log("\n💾 Importing to database...")
  let processed = 0
  const batchSize = 200

  for (let i = 0; i < clientRecords.length; i += batchSize) {
    const batch = clientRecords.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from("clients")
      .upsert(batch, {
        onConflict: "qq_contact_id",
      })

    if (error) {
      console.error(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error)
      throw error
    }

    processed += batch.length
    console.log(`   Batch ${Math.floor(i / batchSize) + 1}: ✅ ${batch.length} records`)
  }

  console.log(`\n🎉 SUCCESS! Imported ${processed} clients`)
  console.log(`   Contacts: ${allContacts.length}`)
  console.log(`   Policies: ${allPolicies.length}`)
  console.log(`   Clients: ${processed}`)
}

main().catch((error) => {
  console.error("\n❌ IMPORT FAILED:", error)
  process.exit(1)
})
