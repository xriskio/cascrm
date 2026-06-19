import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ClientDetailView from "./client-detail-view"
import { ClientTopNav } from "./client-top-nav"
import type { Database } from "@/types/supabase"

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  try {
    let client = null

    // Try to get from contacts table first (QQCatalyst imported data)
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", params.id)
      .single()

    if (contact) {
      client = {
        id: contact.id,
        name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown",
        first_name: contact.first_name,
        last_name: contact.last_name,
        business_name: contact.business_name,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zip: contact.zip,
        status: "active",
        created_at: contact.updated_at || contact.created_at,
        qq_contact_id: contact.id,
        entity_id: contact.id,
        source: "qqcatalyst",
        raw_data: contact.json_raw,
      }
    } else {
      // Try clients table (manual entries)
      const { data: manualClient, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", params.id)
        .single()

      if (manualClient) {
        client = {
          ...manualClient,
          name:
            `${manualClient.first_name || ""} ${manualClient.last_name || ""}`.trim() || manualClient.name || "Unknown",
          source: "manual",
        }
      } else if (clientError) {
        console.error("Error fetching client:", clientError)
      }
    }

    if (!client) {
      console.log(`Client not found with ID: ${params.id}`)
      return notFound()
    }

    console.log(`Found client: ${client.name} (source: ${client.source})`)

    return (
      <div className="h-full flex flex-col">
        {/* Top Navigation */}
        <ClientTopNav client={client} />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ClientDetailView client={client} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in client detail page:", error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
        <p className="text-red-500">
          There was an unexpected error loading the client information. Please try again later.
        </p>
        <p className="text-muted-foreground mt-2">Error details: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    )
  }
}
