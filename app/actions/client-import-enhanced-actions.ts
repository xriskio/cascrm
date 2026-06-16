"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchAllEnhancedContacts } from "@/lib/qqcatalyst/renewals-api"
import { revalidatePath } from "next/cache"

export async function importClientsFromQQCatalyst(params: {
  maxPages?: number
  modifiedSince?: string
}) {
  try {
    const supabase = await createClient()

    console.log("Importing enhanced clients from QQCatalyst")

    // Fetch contacts from QQCatalyst
    const contactsData = await fetchAllEnhancedContacts({
      maxPages: params.maxPages || 50,
      modifiedSince: params.modifiedSince,
    })

    if (contactsData.contacts.length === 0) {
      return {
        success: true,
        imported: 0,
        total: 0,
        message: "No contacts found to import",
      }
    }

    console.log(`Found ${contactsData.contacts.length} contacts`)

    // Transform contacts to client records
    const clientRecords = contactsData.contacts.map((contact) => ({
      qq_contact_id: contact.ContactID,
      qq_entity_id: contact.EntityID,
      qq_customer_number: contact.CustomerNumber,

      first_name: contact.FirstName || "",
      last_name: contact.LastName || "",
      middle_name: contact.MiddleName,
      full_name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim(),
      display_name: contact.BusinessName || `${contact.FirstName || ""} ${contact.LastName || ""}`.trim(),

      business_name: contact.BusinessName,

      email: contact.Email,
      phone: contact.Phone,
      mobile_phone: contact.MobilePhone,
      work_phone: contact.WorkPhone,

      address_line1: contact.AddressLine1,
      address_line2: contact.AddressLine2,
      city: contact.City,
      state: contact.State,
      zip_code: contact.ZipCode,

      date_of_birth: contact.DateOfBirth ? new Date(contact.DateOfBirth).toISOString().split("T")[0] : null,
      ssn: contact.SSN,
      drivers_license_number: contact.DriversLicenseNumber,
      marital_status: contact.MaritalStatus,
      gender: contact.Gender,

      federal_tax_id: contact.FederalTaxID,

      customer_since: contact.CustomerSince ? new Date(contact.CustomerSince).toISOString().split("T")[0] : null,
      customer_status: contact.CustomerStatus || "active",
      customer_type: contact.BusinessName ? "business" : "individual",

      agent_id: contact.AgentID,
      agent_name: contact.AgentName,
      csr_id: contact.CSRID,
      csr_name: contact.CSRName,

      preferred_language: contact.PreferredLanguage || "en",

      qq_raw_data: {
        contact: contact,
        imported_at: new Date().toISOString(),
      },

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
    }))

    // Insert client records into database
    const { data, error } = await supabase
      .from("clients_enhanced")
      .upsert(clientRecords, {
        onConflict: "qq_contact_id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    revalidatePath("/clients")
    revalidatePath("/admin/qqcatalyst")

    return {
      success: true,
      imported: data?.length || 0,
      total: contactsData.contacts.length,
      message: `Successfully imported ${data?.length || 0} clients`,
    }
  } catch (error) {
    console.error("Import clients error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      imported: 0,
      total: 0,
    }
  }
}

export async function getClientsEnhanced(filters?: {
  type?: string
  status?: string
  agent?: string
  search?: string
}) {
  try {
    const supabase = await createClient()

    let query = supabase.from("clients_enhanced").select("*").order("last_name", { ascending: true })

    if (filters?.type && filters.type !== "all") {
      query = query.eq("customer_type", filters.type)
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("customer_status", filters.status)
    }

    if (filters?.agent && filters.agent !== "all") {
      query = query.eq("agent_id", filters.agent)
    }

    if (filters?.search) {
      query = query.or(`
        first_name.ilike.%${filters.search}%,
        last_name.ilike.%${filters.search}%,
        business_name.ilike.%${filters.search}%,
        email.ilike.%${filters.search}%,
        qq_customer_number.ilike.%${filters.search}%
      `)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error("Error fetching enhanced clients:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}
