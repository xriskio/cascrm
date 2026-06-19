import { supabase } from "@/lib/supabase/client"

export async function fetchClients(cacheTime = 5 * 60 * 1000) {
  try {
    // supabase from import

    // First, try to get contacts from QQCatalyst import
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("*")
      .order("updated_at", { ascending: false })

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError)
    }

    // Also try to get from clients table (manual entries)
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (clientsError) {
      console.error("Error fetching clients:", clientsError)
    }

    // Combine and transform the data
    const allClients = []

    // Add QQCatalyst contacts
    if (contacts && contacts.length > 0) {
      const transformedContacts = contacts.map((contact) => ({
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
        status: "active", // Default status for imported contacts
        created_at: contact.updated_at || contact.created_at,
        qq_contact_id: contact.id,
        entity_id: contact.id,
        source: "qqcatalyst",
        raw_data: contact.json_raw,
      }))
      allClients.push(...transformedContacts)
    }

    // Add manual clients
    if (clients && clients.length > 0) {
      const transformedClients = clients.map((client) => ({
        ...client,
        name: client.contact_name || `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown",
        source: "qqcatalyst_import",
      }))
      allClients.push(...transformedClients)
    }

    console.log(
      `Fetched ${allClients.length} total clients (${contacts?.length || 0} from QQCatalyst, ${clients?.length || 0} manual)`,
    )

    return allClients
  } catch (error) {
    console.error("Error in fetchClients:", error)
    throw error
  }
}

export async function fetchClientPolicies(clientId: string) {
  try {
    // supabase from import

    // Try to get policies for this client/contact
    const { data: policies, error } = await supabase
      .from("policies")
      .select("*")
      .or(`client_id.eq.${clientId},contact_id.eq.${clientId}`)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching client policies:", error)
      return []
    }

    return policies || []
  } catch (error) {
    console.error("Error in fetchClientPolicies:", error)
    return []
  }
}

export async function fetchClientWithPolicies(clientId: string) {
  try {
    // supabase from import

    // Get client/contact info
    let client = null

    // Try contacts table first (QQCatalyst data)
    const { data: contact } = await supabase.from("contacts").select("*").eq("id", clientId).single()

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
      const { data: manualClient } = await supabase.from("clients").select("*").eq("id", clientId).single()

      if (manualClient) {
        client = {
          ...manualClient,
          name:
            `${manualClient.first_name || ""} ${manualClient.last_name || ""}`.trim() || manualClient.name || "Unknown",
          source: "manual",
        }
      }
    }

    if (!client) {
      throw new Error("Client not found")
    }

    // Get policies
    const policies = await fetchClientPolicies(clientId)

    return {
      client,
      policies,
    }
  } catch (error) {
    console.error("Error in fetchClientWithPolicies:", error)
    throw error
  }
}

export async function importClientsInBatches(clients: any[], batchSize = 100) {
  const results = {
    success: 0,
    errors: 0,
    total: clients.length,
    errorDetails: [] as string[],
  }

  for (let i = 0; i < clients.length; i += batchSize) {
    const batch = clients.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1

    try {
      const response = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: batch }),
      })

      if (!response.ok) {
        throw new Error(`Batch ${batchNumber} failed: ${response.statusText}`)
      }

      const batchResult = await response.json()
      results.success += batchResult.success || batch.length
    } catch (error: any) {
      console.error(`Batch ${batchNumber} error:`, error)
      results.errors += batch.length
      results.errorDetails.push(`Batch ${batchNumber}: ${error.message}`)
    }

    // give the API a breather
    await new Promise((r) => setTimeout(r, 1000))
  }

  return results
}
