import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const QQ_API_URL = process.env.QQCATALYST_API_URL
const QQ_BEARER_TOKEN = process.env.QQ_BEARER_TOKEN

async function fetchQQData(endpoint: string, page: number = 1) {
  if (!QQ_API_URL || !QQ_BEARER_TOKEN) {
    throw new Error("QQCatalyst API credentials not configured")
  }

  const url = `${QQ_API_URL}${endpoint}?pageNumber=${page}&startDate=2000-01-01&endDate=2030-01-01&pageSize=100`
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${QQ_BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`QQ API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function POST() {
  try {
    console.log("🚀 Starting QQCatalyst import...")

    // Fetch contacts
    const allContacts: any[] = []
    for (let page = 1; page <= 5; page++) {
      const data = await fetchQQData("Contacts/LastModifiedCreated", page)
      if (!data?.Data || data.Data.length === 0) break
      allContacts.push(...Data.Data)
    }
    console.log(`✅ Fetched ${allContacts.length} contacts`)

    // Fetch policies
    const allPolicies: any[] = []
    for (let page = 1; page <= 5; page++) {
      const data = await fetchQQData("Policies/LastModifiedCreated", page)
      if (!data?.Data || data.Data.length === 0) break
      allPolicies.push(...Data.Data)
    }
    console.log(`✅ Fetched ${allPolicies.length} policies`)

    // Group policies by CustomerID
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
        const premium = typeof policy.Premium === 'number' 
          ? policy.Premium 
          : parseFloat(String(policy.Premium || 0))
        const totalPrem = typeof policy.TotalPremium === 'number'
          ? policy.TotalPremium
          : parseFloat(String(policy.TotalPremium || 0))
        
        totalPremium += Math.max(premium, totalPrem) || 0

        if (policy.RenewalDate) {
          if (!earliestRenewal || new Date(policy.RenewalDate) < new Date(earliestRenewal)) {
            earliestRenewal = policy.RenewalDate
          }
        }
      }

      // Create client record
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

    // Insert using Supabase (batch of 200)
    let processed = 0
    const batchSize = 200

    for (let i = 0; i < clientRecords.length; i += batchSize) {
      const batch = clientRecords.slice(i, i + batchSize)
      
      const { error } = await supabaseAdmin
        .from("clients")
        .upsert(batch, {
          onConflict: "qq_contact_id",
        })

      if (error) {
        console.error(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error)
        throw error
      }

      processed += batch.length
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Processed ${batch.length} records`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${processed} clients`,
      stats: {
        contacts: allContacts.length,
        policies: allPolicies.length,
        clients_processed: processed,
      },
    })
  } catch (error) {
    console.error("❌ Import error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
