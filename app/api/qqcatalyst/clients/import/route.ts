export const dynamic = "force-dynamic"
export const runtime = 'nodejs'
export const revalidate = 0
export const maxDuration = 60 // Allow up to 60 seconds

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { fetchAllContacts, fetchAllPolicies } from "@/lib/qqcatalyst/api-enhanced"

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Starting QQCatalyst clients import with policy data...")

    // Fetch contacts and policies in parallel (smaller batch size for stability)
    // Using 2 pages = ~1000 records max to avoid timeouts
    const [contacts, policies] = await Promise.all([
      fetchAllContacts(2).catch((err) => {
        console.error("Error fetching contacts:", err)
        return []
      }),
      fetchAllPolicies(2).catch((err) => {
        console.error("Error fetching policies:", err)
        return []
      }),
    ])

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        total: 0,
        message: "No contacts found to import",
      })
    }

    console.log(`✅ Found ${contacts.length} contacts and ${policies.length} policies`)

    // Group policies by CustomerId (which references contact's EntityID)
    const policiesByContact: Record<string, any[]> = {}
    for (const policy of policies) {
      const customerId = policy.CustomerId
      if (customerId) {
        const key = String(customerId)
        if (!policiesByContact[key]) {
          policiesByContact[key] = []
        }
        policiesByContact[key].push(policy)
      }
    }

    console.log(`📊 Grouped policies for ${Object.keys(policiesByContact).length} unique customers`)
    
    // Transform contacts to clients format with policy data
    const transformedClients = contacts.map((contact: any) => {
      // Use EntityID from contact (matches CustomerId in policies)
      const entityId = String(contact.EntityID || '')
      const contactPolicies = policiesByContact[entityId] || []

      // Calculate aggregated policy data
      const totalPremium = contactPolicies.reduce((sum, p) => {
        const premium = parseFloat(p.TotalPremium || p.Premium || 0)
        return sum + (isNaN(premium) ? 0 : premium)
      }, 0)

      // Find the next renewal date (earliest expiration date)
      const renewalDate = contactPolicies
        .map((p) => p.ExpirationDate || p.Expiration)
        .filter(Boolean)
        .sort()
        [0] // Get the earliest expiration date

      // Create policy summaries for json_raw
      const policyData = contactPolicies.map((p) => ({
        policyId: p.PolicyId,
        policyNumber: p.PolicyNumber,
        namedInsured: p.CustomerName,
        policyType: p.PolicyType,
        lob: p.LOB,
        effectiveDate: p.EffectiveDate,
        expirationDate: p.ExpirationDate,
        premium: parseFloat(p.TotalPremium || 0),
        insuranceCompany: p.WritingCarrier,
        carrier: p.WritingCarrier,
        status: p.Status,
        description: p.Description,
        agentName: p.AgentName,
        mga: p.MGA,
      }))

      return {
        contact_name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim() || "Unknown",
        first_name: contact.FirstName || "",
        last_name: contact.LastName || "",
        name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim() || contact.BusinessName || contact.DisplayName || "Unknown",
        business_name: contact.BusinessName || null,
        email: contact.Email || null,
        phone: contact.Phone || null,
        address: contact.Line1 || null,
        city: contact.City || null,
        state: contact.State || null,
        zip: contact.Zip || null,
        zip_code: contact.Zip || null,
        qq_contact_id: entityId,
        customer_id: entityId,
        entity_id: contact.EntityID,
        status: "active",
        policy_count: contactPolicies.length,
        total_premium: totalPremium,
        renewal_date: renewalDate || null,
        json_raw: {
          contact,
          policies: policyData,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Deduplicate clients by qq_contact_id (keep first occurrence)
    // Also filter out any with empty qq_contact_id
    const uniqueClients: Record<string, any> = {}
    for (const client of transformedClients) {
      if (client.qq_contact_id && !uniqueClients[client.qq_contact_id]) {
        uniqueClients[client.qq_contact_id] = client
      }
    }
    const deduplicatedClients = Object.values(uniqueClients)

    console.log(`📝 Deduplication: ${transformedClients.length} total → ${deduplicatedClients.length} unique clients`)
    if (deduplicatedClients.length > 0) {
      const sampleWithPolicies = deduplicatedClients.find(c => c.policy_count > 0) || deduplicatedClients[0]
      console.log(`✨ Sample client:`, {
        name: sampleWithPolicies.name,
        qq_contact_id: sampleWithPolicies.qq_contact_id,
        policyCount: sampleWithPolicies.policy_count,
        totalPremium: sampleWithPolicies.total_premium,
      })
    }

    if (deduplicatedClients.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid clients to import - all contacts have missing EntityIDs",
        imported: 0,
        total: contacts.length,
      }, { status: 400 })
    }

    // Insert clients into our database
    const { data, error } = await supabaseAdmin
      .from("clients")
      .upsert(deduplicatedClients, {
        onConflict: "qq_contact_id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("❌ Database error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw new Error(`Database error: ${error.message} (${error.code})`)
    }

    const clientsWithPolicies = data?.filter(c => c.policy_count > 0).length || 0

    console.log(`✅ Successfully imported ${data?.length || 0} clients (${clientsWithPolicies} with policies)`)

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: contacts.length,
      policiesProcessed: policies.length,
      clientsWithPolicies,
      message: `Successfully imported ${data?.length || 0} clients (${clientsWithPolicies} with policies) from QQCatalyst`,
    })
  } catch (error) {
    console.error("❌ Clients import error:", error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during clients import",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
