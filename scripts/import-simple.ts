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
    pageSize: "100",
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

async function main() {
  console.log("🚀 Starting full QQCatalyst import...")

  // Fetch first page to get total count
  const firstPage = await fetchContacts(1)
  const totalPages = firstPage.PagesTotal || 1
  const totalItems = firstPage.TotalItems || 0
  console.log(`📊 Found ${totalItems} total contacts across ${totalPages} pages\n`)

  let totalProcessed = 0

  // Loop through all pages
  for (let page = 1; page <= totalPages; page++) {
    console.log(`📥 Fetching page ${page}/${totalPages}...`)
    const response = await fetchContacts(page)
    const contacts = response.Data || []
    
    if (contacts.length === 0) {
      console.log("   No contacts on this page, skipping...")
      continue
    }

    // Process contacts - only fields that work (no UUID fields like entity_id)
    const clientRecords = contacts.map((contact: any) => ({
      qq_contact_id: String(contact.EntityID || contact.ContactID),
      contact_name: contact.ContactName || null,
      first_name: contact.FirstName || null,
      last_name: contact.LastName || null,
      name: contact.DisplayName || contact.ContactName || `${contact.FirstName || ""} ${contact.LastName || ""}`.trim() || "Unknown",
      business_name: contact.BusinessName || null,
      email: contact.Email || null,
      phone: contact.Phone || null,
      address: contact.Line1 || null,
      address_line2: contact.Line2 || null,
      city: contact.City || null,
      state: contact.State || null,
      zip: contact.Zip || null,
      zip_code: contact.Zip || null,
      status: "active",
    }))

    // Insert in small batches (20 at a time)
    let pageProcessed = 0
    const batchSize = 20

    for (let i = 0; i < clientRecords.length; i += batchSize) {
      const batch = clientRecords.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from("clients")
        .upsert(batch, {
          onConflict: "qq_contact_id",
        })

      if (error) {
        console.error(`   ❌ Error in batch:`, error)
        continue
      }

      pageProcessed += batch.length
      totalProcessed += batch.length
    }

    console.log(`   ✅ Imported ${pageProcessed} contacts (${totalProcessed}/${totalItems} total)`)
    
    // Small delay to avoid overwhelming the API/database
    if (page < totalPages) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`\n✨ COMPLETE! Successfully imported ${totalProcessed} clients from QQCatalyst`)
}

main().catch((error) => {
  console.error("\n❌ IMPORT FAILED:", error)
  process.exit(1)
})
