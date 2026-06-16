"use server"

import { createClient } from "@/lib/supabase"
import { fetchAllContacts, getContactPolicies } from "@/lib/qqcatalyst/qq"
import { handleAsyncError, createSuccessResponse } from "@/lib/error-utils"
import { revalidatePath } from "next/cache"

const adminSupabase = createClient({ useServiceRole: true })

/**
 * Test QQCatalyst connection
 */
export async function testQQCatalystConnection() {
  try {
    // Just try to fetch a single contact to test the connection
    const result = await fetchAllContacts()

    return createSuccessResponse({
      message: "Successfully connected to QQCatalyst API",
      data: { contactsFound: result.length },
    })
  } catch (error) {
    console.error("QQCatalyst connection test failed:", error)
    return handleAsyncError(error)
  }
}

/**
 * Import contacts from QQCatalyst
 */
export async function importContactsFromQQCatalyst() {
  try {
    // Fetch contacts from QQCatalyst
    const contacts = await fetchAllContacts()

    if (contacts.length === 0) {
      return createSuccessResponse({
        imported: 0,
        total: 0,
        message: "No contacts found to import",
      })
    }

    console.log(`Found ${contacts.length} contacts to import`)

    // Transform and insert contacts
    const transformedContacts = contacts.map((contact: any) => ({
      id: contact.ContactID || contact.ID,
      first_name: contact.FirstName || "",
      last_name: contact.LastName || "",
      email: contact.Email || contact.EmailAddress || null,
      phone: contact.Phone || contact.PhoneNumber || contact.WorkPhone || null,
      json_raw: contact,
      updated_at: new Date().toISOString(),
    }))

    // Insert contacts into our database
    const { data, error } = await adminSupabase
      .from("contacts")
      .upsert(transformedContacts, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    revalidatePath("/admin/qqcatalyst")
    return createSuccessResponse({
      imported: data?.length || 0,
      total: contacts.length,
      message: `Successfully imported ${data?.length || 0} contacts`,
    })
  } catch (error) {
    console.error("Import contacts error:", error)
    return handleAsyncError(error)
  }
}

/**
 * Import policies from QQCatalyst
 */
export async function importPoliciesFromQQCatalyst() {
  try {
    // First get all contacts
    const contacts = await fetchAllContacts()

    if (contacts.length === 0) {
      return createSuccessResponse({
        imported: 0,
        total: 0,
        message: "No contacts found to import policies from",
      })
    }

    const allPolicies = []
    let processedContacts = 0

    // Process a limited number of contacts to avoid timeouts
    const contactLimit = Math.min(contacts.length, 20)

    for (let i = 0; i < contactLimit; i++) {
      const contact = contacts[i]
      try {
        const contactId = contact.ContactID || contact.ID
        const policiesData = await getContactPolicies(contactId)
        const policies = policiesData.Policies || []

        if (policies.length > 0) {
          // Transform policies
          const transformedPolicies = policies.map((policy: any) => ({
            id: policy.PolicyID || policy.ID,
            contact_id: contactId,
            policy_number: policy.PolicyNumber || policy.Number || "",
            line_of_business: policy.LineOfBusiness || policy.PolicyType || "Unknown",
            json_raw: policy,
            updated_at: new Date().toISOString(),
          }))

          allPolicies.push(...transformedPolicies)
        }

        processedContacts++
      } catch (error) {
        console.error(`Error fetching policies for contact ${contact.ContactID || contact.ID}:`, error)
        // Continue with other contacts
      }
    }

    if (allPolicies.length === 0) {
      return createSuccessResponse({
        imported: 0,
        total: 0,
        message: `No policies found in ${processedContacts} contacts`,
      })
    }

    // Insert policies into our database
    const { data, error } = await adminSupabase
      .from("policies")
      .upsert(allPolicies, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    revalidatePath("/admin/qqcatalyst")
    return createSuccessResponse({
      imported: data?.length || 0,
      total: allPolicies.length,
      message: `Successfully imported ${data?.length || 0} policies from ${processedContacts} contacts`,
    })
  } catch (error) {
    console.error("Import policies error:", error)
    return handleAsyncError(error)
  }
}

export async function importClientsFromQQCatalyst() {
  try {
    // Fetch contacts from QQCatalyst
    const contacts = await fetchAllContacts()

    if (contacts.length === 0) {
      return createSuccessResponse({
        imported: 0,
        total: 0,
        message: "No clients found to import",
      })
    }

    // Transform contacts to clients format
    const transformedClients = contacts.map((contact: any) => ({
      id: contact.ContactID || contact.ID,
      name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim(),
      first_name: contact.FirstName || "",
      last_name: contact.LastName || "",
      email: contact.Email || contact.EmailAddress || null,
      phone: contact.Phone || contact.PhoneNumber || contact.WorkPhone || null,
      qq_contact_id: contact.ContactID || contact.ID,
      json_raw: contact,
      updated_at: new Date().toISOString(),
    }))

    // Insert clients into our database
    const { data, error } = await adminSupabase
      .from("clients")
      .upsert(transformedClients, {
        onConflict: "qq_contact_id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    revalidatePath("/clients")
    return createSuccessResponse({
      imported: data?.length || 0,
      total: contacts.length,
      message: `Successfully imported ${data?.length || 0} clients`,
    })
  } catch (error) {
    console.error("Import clients error:", error)
    return handleAsyncError(error)
  }
}

export async function importRenewalsFromQQCatalyst() {
  try {
    // First get all contacts
    const contacts = await fetchAllContacts()

    if (contacts.length === 0) {
      return createSuccessResponse({
        imported: 0,
        total: 0,
        message: "No contacts found to import renewals from",
      })
    }

    const allRenewals = []
    let processedContacts = 0

    // Process contacts to get their policies and create renewals
    const contactLimit = Math.min(contacts.length, 50)

    for (let i = 0; i < contactLimit; i++) {
      const contact = contacts[i]
      try {
        const contactId = contact.ContactID || contact.ID
        const policiesData = await getContactPolicies(contactId)
        const policies = policiesData.Policies || []

        if (policies.length > 0) {
          // Transform policies to renewals
          const transformedRenewals = policies.map((policy: any) => ({
            id: `${policy.PolicyID || policy.ID}-renewal`,
            policy_id: policy.PolicyID || policy.ID,
            policy_number: policy.PolicyNumber || policy.Number || "",
            client_name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim(),
            line_of_business: policy.LineOfBusiness || policy.PolicyType || "Unknown",
            expiration_date: policy.ExpirationDate || null,
            status: "pending",
            json_raw: { policy, contact },
            updated_at: new Date().toISOString(),
          }))

          allRenewals.push(...transformedRenewals)
        }

        processedContacts++
      } catch (error) {
        console.error(`Error processing contact ${contact.ContactID || contact.ID}:`, error)
        // Continue with other contacts
      }
    }

    if (allRenewals.length === 0) {
      return createSuccessResponse({
        imported: 0,
        total: 0,
        message: `No renewals found in ${processedContacts} contacts`,
      })
    }

    // Insert renewals into our database
    const { data, error } = await adminSupabase
      .from("renewals")
      .upsert(allRenewals, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    revalidatePath("/renewals")
    return createSuccessResponse({
      imported: data?.length || 0,
      total: allRenewals.length,
      message: `Successfully imported ${data?.length || 0} renewals from ${processedContacts} contacts`,
    })
  } catch (error) {
    console.error("Import renewals error:", error)
    return handleAsyncError(error)
  }
}
