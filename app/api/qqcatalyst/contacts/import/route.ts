import { NextResponse } from "next/server"
import { QQCatalystClient } from "@/lib/qqcatalyst/client"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// GET method for client page import button
export async function GET() {
  try {
    console.log("🔄 Starting QQCatalyst contacts import...")

    // Initialize QQCatalyst client
    const qqClient = new QQCatalystClient()
    await qqClient.getToken()

    // Fetch user locations to get contacts
    console.log("📍 Fetching user locations from QQCatalyst...")
    const locationsResponse = await qqClient.request("Locations/UserLocationsV2", "GET")

    if (!locationsResponse?.Data || !Array.isArray(locationsResponse.Data)) {
      console.log("❌ No locations found")
      return NextResponse.json({
        success: false,
        error: "No locations found in QQCatalyst",
        imported: 0,
        total: 0,
      })
    }

    const locations = locationsResponse.Data
    console.log(`✅ Found ${locations.length} locations`)

    // For each location, fetch contacts
    const allContacts: any[] = []
    for (const location of locations.slice(0, 5)) {
      // Limit to first 5 locations to prevent timeout
      try {
        const locationId = location.LocationID || location.Id
        if (!locationId) continue

        console.log(`📋 Fetching contacts for location ${locationId}...`)
        const contactsResponse = await qqClient.request(
          `Locations/${locationId}/Contacts/AddressInfo`,
          "GET"
        )

        if (contactsResponse?.Data && Array.isArray(contactsResponse.Data)) {
          allContacts.push(...contactsResponse.Data)
        }
      } catch (error) {
        console.error(`Error fetching contacts for location:`, error)
        // Continue with other locations
      }
    }

    console.log(`📊 Total contacts found: ${allContacts.length}`)

    if (allContacts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No contacts found to import",
        imported: 0,
        total: 0,
      })
    }

    // Initialize Supabase client
    const supabase = await createClient()

    let importedCount = 0
    const errors: string[] = []

    // Import each contact as a client
    for (const contact of allContacts) {
      try {
        // Generate unique client number
        const clientNumber = `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

        // Build full name
        const firstName = contact.FirstName || contact.first_name || ""
        const lastName = contact.LastName || contact.last_name || ""
        const fullName =
          contact.BusinessName || contact.business_name || `${firstName} ${lastName}`.trim() || "Unknown"

        // Build address
        const address = [contact.Line1 || contact.address1, contact.Line2 || contact.address2]
          .filter(Boolean)
          .join(", ")

        // Map QQCatalyst contact to client format
        const clientData = {
          client_number: clientNumber,
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          business_name: contact.BusinessName || contact.business_name || null,
          email: contact.Email || contact.email || null,
          phone: contact.Phone || contact.phone || null,
          address: address || null,
          city: contact.City || contact.city || null,
          state: contact.State || contact.state || null,
          zip_code: contact.Zip || contact.ZipCode || contact.zip_code || null,
          qq_contact_id: String(contact.ContactID || contact.Id || clientNumber),
          status: contact.Status === "A" || contact.Status === "Active" ? "active" : "inactive",
          contact_type: contact.ContactType || contact.contact_type || null,
          location_id: contact.LocationID || contact.location_id || null,
          json_raw: contact,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Check if client already exists by QQ contact ID
        if (clientData.qq_contact_id) {
          const { data: existing } = await supabase
            .from("clients")
            .select("id")
            .eq("qq_contact_id", clientData.qq_contact_id)
            .single()

          if (existing) {
            // Update existing client
            const { error } = await supabase
              .from("clients")
              .update({
                ...clientData,
                updated_at: new Date().toISOString(),
              })
              .eq("qq_contact_id", clientData.qq_contact_id)

            if (error) {
              console.error(`Error updating client ${clientData.qq_contact_id}:`, error)
              errors.push(`Contact ${clientData.qq_contact_id}: ${error.message}`)
            } else {
              importedCount++
            }
            continue
          }
        }

        // Insert new client
        const { error } = await supabase.from("clients").insert(clientData)

        if (error) {
          console.error(`Error inserting client ${fullName}:`, error)
          errors.push(`Contact ${fullName}: ${error.message}`)
        } else {
          importedCount++
        }
      } catch (error) {
        console.error(`Error processing contact:`, error)
        errors.push(`${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported/updated ${importedCount} of ${allContacts.length} clients from QQCatalyst`,
      imported: importedCount,
      total: allContacts.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    })
  } catch (error) {
    console.error("❌ Error importing contacts from QQCatalyst:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to import contacts from QQCatalyst",
        imported: 0,
        total: 0,
      },
      { status: 500 }
    )
  }
}
