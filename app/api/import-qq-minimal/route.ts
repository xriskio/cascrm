import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const QQ_API_URL = process.env.QQCATALYST_API_URL
const QQ_BEARER_TOKEN = process.env.QQCATALYST_BEARER_TOKEN

async function fetchContacts(pageNumber: number = 1) {
  const params = new URLSearchParams({
    startDate: "2014-06-01",
    endDate: "2025-12-31",
    pageNumber: pageNumber.toString(),
    pageSize: "50",
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
    throw new Error(`QQ API error: ${response.status}`)
  }

  return response.json()
}

export async function POST() {
  try {
    console.log("Starting minimal import...")

    // Fetch just 50 contacts
    const response = await fetchContacts(1)
    const contacts = response.Data || []
    console.log(`Fetched ${contacts.length} contacts`)

    // Process ONE contact at a time
    let imported = 0
    for (const contact of contacts) {
      try {
        const clientRecord = {
          qq_contact_id: contact.ContactID,
          customer_id: contact.CustomerID || null,
          entity_id: contact.EntityID || null,
          contact_name: contact.ContactName || null,
          first_name: contact.FirstName || null,
          last_name: contact.LastName || null,
          name: contact.Name || contact.ContactName || `${contact.FirstName || ""} ${contact.LastName || ""}`.trim() || "Unknown",
          business_name: contact.BusinessName || null,
          email: contact.Email || null,
          phone: contact.Phone || null,
          address: contact.Address || null,
          city: contact.City || null,
          state: contact.State || null,
          zip: contact.Zip || contact.ZipCode || null,
          zip_code: contact.ZipCode || contact.Zip || null,
          policy_count: 0,
          total_premium: "0",
          status: "active",
        }

        const { error } = await supabaseAdmin
          .from("clients")
          .upsert([clientRecord], { onConflict: "qq_contact_id" })

        if (!error) {
          imported++
        }
      } catch (err) {
        console.error(`Failed to import ${contact.ContactID}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} clients`,
      total: contacts.length,
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
