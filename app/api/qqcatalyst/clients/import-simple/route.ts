import { NextResponse } from "next/server"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { clients } from "@/shared/schema"
import { sql } from "drizzle-orm"

const QQ_API_URL = process.env.QQCATALYST_API_URL
const QQ_BEARER_TOKEN = process.env.QQCATALYST_BEARER_TOKEN

interface QQContact {
  ContactID: string
  CustomerID?: string
  EntityID?: string
  ContactName?: string
  FirstName?: string
  LastName?: string
  Name?: string
  BusinessName?: string
  Email?: string
  Phone?: string
  Address?: string
  City?: string
  State?: string
  Zip?: string
  ZipCode?: string
}

interface QQPolicy {
  PolicyID: string
  CustomerID?: string
  PolicyNumber?: string
  NamedInsured?: string
  PolicyType?: string
  LOB?: string
  EffectiveDate?: string
  ExpirationDate?: string
  RenewalDate?: string
  Premium?: number | string
  TotalPremium?: number | string
  InsuranceCompany?: string
  Carrier?: string
  AgentName?: string
  MGA?: string
}

async function fetchQQData(endpoint: string, page: number = 1) {
  if (!QQ_API_URL || !QQ_BEARER_TOKEN) {
    throw new Error("QQCatalyst API credentials not configured")
  }

  const url = `${QQ_API_URL}${endpoint}?page=${page}&pageSize=100`
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
    console.log("Starting simplified QQCatalyst import...")

    // Initialize Drizzle client
    const connectionString = process.env.DATABASE_URL!
    const client = postgres(connectionString)
    const db = drizzle(client)

    // Fetch all contacts (limit to 5 pages for safety)
    const allContacts: QQContact[] = []
    for (let page = 1; page <= 5; page++) {
      const data = await fetchQQData("/contacts", page)
      if (!data?.data || data.data.length === 0) break
      allContacts.push(...data.data)
    }
    console.log(`Fetched ${allContacts.length} contacts`)

    // Fetch all policies (limit to 5 pages for safety)
    const allPolicies: QQPolicy[] = []
    for (let page = 1; page <= 5; page++) {
      const data = await fetchQQData("/policies", page)
      if (!data?.data || data.data.length === 0) break
      allPolicies.push(...data.data)
    }
    console.log(`Fetched ${allPolicies.length} policies`)

    // Group policies by CustomerID
    const policiesByCustomer = new Map<string, QQPolicy[]>()
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

      // Calculate aggregated metrics
      let totalPremium = 0
      let earliestRenewal: Date | null = null

      for (const policy of contactPolicies) {
        // Sum premiums
        const premium = typeof policy.Premium === 'number' 
          ? policy.Premium 
          : parseFloat(String(policy.Premium || 0))
        const totalPrem = typeof policy.TotalPremium === 'number'
          ? policy.TotalPremium
          : parseFloat(String(policy.TotalPremium || 0))
        
        totalPremium += Math.max(premium, totalPrem) || 0

        // Find earliest renewal date
        if (policy.RenewalDate) {
          const renewalDate = new Date(policy.RenewalDate)
          if (!earliestRenewal || renewalDate < earliestRenewal) {
            earliestRenewal = renewalDate
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

    console.log(`Prepared ${clientRecords.length} client records`)

    // Batch insert (200 at a time)
    let inserted = 0
    let updated = 0
    const batchSize = 200

    for (let i = 0; i < clientRecords.length; i += batchSize) {
      const batch = clientRecords.slice(i, i + batchSize)
      
      try {
        await db
          .insert(clients)
          .values(batch)
          .onConflictDoUpdate({
            target: clients.qq_contact_id,
            set: {
              customer_id: sql`EXCLUDED.customer_id`,
              entity_id: sql`EXCLUDED.entity_id`,
              contact_name: sql`EXCLUDED.contact_name`,
              first_name: sql`EXCLUDED.first_name`,
              last_name: sql`EXCLUDED.last_name`,
              name: sql`EXCLUDED.name`,
              business_name: sql`EXCLUDED.business_name`,
              email: sql`EXCLUDED.email`,
              phone: sql`EXCLUDED.phone`,
              address: sql`EXCLUDED.address`,
              city: sql`EXCLUDED.city`,
              state: sql`EXCLUDED.state`,
              zip: sql`EXCLUDED.zip`,
              zip_code: sql`EXCLUDED.zip_code`,
              policy_count: sql`EXCLUDED.policy_count`,
              total_premium: sql`EXCLUDED.total_premium`,
              renewal_date: sql`EXCLUDED.renewal_date`,
              json_raw: sql`EXCLUDED.json_raw`,
              updated_at: sql`NOW()`,
            },
          })

        inserted += batch.length
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: Processed ${batch.length} records`)
      } catch (error) {
        console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, error)
        throw error
      }
    }

    // Close the connection
    await client.end()

    return NextResponse.json({
      success: true,
      message: `Import completed successfully`,
      stats: {
        contacts: allContacts.length,
        policies: allPolicies.length,
        clients_processed: clientRecords.length,
      },
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
