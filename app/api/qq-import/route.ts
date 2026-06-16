export const dynamic = "force-dynamic"

export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get QQCatalyst token from environment variable
function getQQToken() {
  const token = process.env.QQ_ACCESS_TOKEN
  if (!token) {
    throw new Error("QQ_ACCESS_TOKEN environment variable is not set")
  }
  return token
}

const QQ_API_BASE = "https://api.qqcatalyst.com/v1"

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Starting full QQ import...")

    const supabase = await createClient()
    let contactsImported = 0
    let renewalsImported = 0

    // Step 1: Import Contacts
    console.log("📞 Importing contacts...")
    const contactsUrl = `${QQ_API_BASE}/Contacts/LastModifiedCreated?startDate=2020-01-01&endDate=2025-12-31&pageNumber=1&pageSize=1000`

    const contactsResponse = await fetch(contactsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getQQToken()}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!contactsResponse.ok) {
      throw new Error(`Contacts API failed: ${contactsResponse.status}`)
    }

    const contactsData = await contactsResponse.json()
    console.log(`📊 Found ${contactsData.length} contacts`)

    // Process contacts
    for (const contact of contactsData) {
      try {
        const { data, error } = await supabase
          .from("clients")
          .upsert(
            {
              name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim() || "Unknown Name",
              business_name: contact.CompanyName || null,
              email: contact.EmailAddress1 || null,
              phone: contact.Phone1 || null,
              address: contact.Address1 || null,
              city: contact.City || null,
              state: contact.State || null,
              zip: contact.Zip || null,
              qq_contact_id: contact.ContactId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "qq_contact_id" },
          )
          .select()

        if (error) {
          console.error(`❌ Error importing contact ${contact.ContactId}:`, error)
        } else {
          contactsImported++
        }
      } catch (err) {
        console.error(`❌ Error processing contact ${contact.ContactId}:`, err)
      }
    }

    // Step 2: Import Policies/Renewals
    console.log("📝 Importing policies/renewals...")
    const policiesUrl = `${QQ_API_BASE}/Policies?pageNumber=1&pageSize=1000`

    const policiesResponse = await fetch(policiesUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getQQToken()}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!policiesResponse.ok) {
      throw new Error(`Policies API failed: ${policiesResponse.status}`)
    }

    const policiesData = await policiesResponse.json()
    console.log(`📊 Found ${policiesData.length} policies`)

    // Process policies as renewals
    for (const policy of policiesData) {
      try {
        // Find the client by QQ contact ID
        const { data: clientData } = await supabase
          .from("clients")
          .select("id, name")
          .eq("qq_contact_id", policy.ContactId)
          .maybeSingle()

        const clientId = clientData?.id
        const clientName = clientData?.name || "Unknown Client"

        // Format the expiration date
        let expirationDate = null
        if (policy.ExpirationDate) {
          try {
            expirationDate = new Date(policy.ExpirationDate).toISOString()
          } catch (e) {
            console.error(`❌ Invalid expiration date for policy ${policy.PolicyId}:`, policy.ExpirationDate)
          }
        }

        // Insert or update the renewal
        const { data, error } = await supabase
          .from("renewals")
          .upsert(
            {
              client_id: clientId,
              client_name: clientName,
              policy_number: policy.PolicyNumber || null,
              policy_type: policy.LineOfBusiness || "Unknown",
              carrier: policy.CarrierName || null,
              expiration_date: expirationDate,
              policy_premium: policy.Premium || 0,
              status: "pending",
              qq_policy_id: policy.PolicyId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "qq_policy_id" },
          )
          .select()

        if (error) {
          console.error(`❌ Error importing policy ${policy.PolicyId}:`, error)
        } else {
          renewalsImported++
        }
      } catch (err) {
        console.error(`❌ Error processing policy ${policy.PolicyId}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Import completed successfully",
      contacts: contactsImported,
      renewals: renewalsImported,
    })
  } catch (error) {
    console.error("❌ Import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
