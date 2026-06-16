"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCarrierContacts() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("carrier_contacts")
      .select("*")
      .order("insurance_carrier", { ascending: true })

    if (error) {
      console.error("Error fetching carrier contacts:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error fetching carrier contacts:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getCarrierContactById(id: string) {
  try {
    // Validate UUID format to prevent database errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return { success: false, error: "Invalid carrier ID format" }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("carrier_contacts").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching carrier contact with ID ${id}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error(`Unexpected error fetching carrier contact with ID ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function createCarrierContact(formData: FormData) {
  try {
    const supabase = await createClient()

    // Extract basic carrier information
    const insurance_carrier = formData.get("insurance_carrier") as string
    const producer_code = formData.get("producer_code") as string
    const website_link = formData.get("website_link") as string
    const website_login = formData.get("website_login") as string
    const agency_user_id = formData.get("agency_user_id") as string
    const password = formData.get("password") as string
    const customer_service_phone = formData.get("customer_service_phone") as string
    const billing_phone = formData.get("billing_phone") as string
    const agency_contact_name = formData.get("agency_contact_name") as string
    const agency_contact_number = formData.get("agency_contact_number") as string
    const agency_contact_email = formData.get("agency_contact_email") as string
    const loss_run_request_link = formData.get("loss_run_request_link") as string
    const claims_email = formData.get("claims_email") as string
    const claims_phone_number = formData.get("claims_phone_number") as string
    const notes = formData.get("notes") as string

    // Extract specialties (multi-select)
    const specialtiesValues = formData.getAll("specialties") as string[]

    // Process underwriters (can be multiple)
    const underwriterCount = Number.parseInt((formData.get("underwriter_count") as string) || "0")
    const underwriters = []

    for (let i = 0; i < underwriterCount; i++) {
      const name = formData.get(`underwriter_name_${i}`) as string
      const phone = formData.get(`underwriter_phone_${i}`) as string
      const email = formData.get(`underwriter_email_${i}`) as string

      // Get lines of business for this underwriter (multi-select)
      const linesOfBusiness = formData.getAll(`underwriter_lines_${i}`) as string[]

      if (name || phone || email) {
        underwriters.push({
          name,
          phone,
          email,
          lines_of_business: linesOfBusiness,
        })
      }
    }

    // Set the first underwriter as the primary one for backward compatibility
    const primaryUnderwriter = underwriters[0] || { name: "", phone: "", email: "" }

    // Generate carrier tracking number
    const carrierNumber = `CAR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const { data, error } = await supabase
      .from("carrier_contacts")
      .insert({
        carrier_number: carrierNumber,
        insurance_carrier,
        producer_code,
        website_link,
        website_login,
        agency_user_id,
        password,
        customer_service_phone,
        billing_phone,
        agency_contact_name,
        agency_contact_number,
        agency_contact_email,

        // For backward compatibility
        underwriter_contact: primaryUnderwriter.name,
        underwriter_number: primaryUnderwriter.phone,
        underwriter_email: primaryUnderwriter.email,

        loss_run_request_link,
        claims_email,
        claims_phone_number,
        specialties: specialtiesValues,
        notes,
        underwriters,
      })
      .select()

    if (error) {
      console.error("Error creating carrier contact:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/carrier-contacts")
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Unexpected error creating carrier contact:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateCarrierContact(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // Extract basic carrier information
    const insurance_carrier = formData.get("insurance_carrier") as string
    const producer_code = formData.get("producer_code") as string
    const website_link = formData.get("website_link") as string
    const website_login = formData.get("website_login") as string
    const agency_user_id = formData.get("agency_user_id") as string
    const password = formData.get("password") as string
    const customer_service_phone = formData.get("customer_service_phone") as string
    const billing_phone = formData.get("billing_phone") as string
    const agency_contact_name = formData.get("agency_contact_name") as string
    const agency_contact_number = formData.get("agency_contact_number") as string
    const agency_contact_email = formData.get("agency_contact_email") as string
    const loss_run_request_link = formData.get("loss_run_request_link") as string
    const claims_email = formData.get("claims_email") as string
    const claims_phone_number = formData.get("claims_phone_number") as string
    const notes = formData.get("notes") as string

    // Extract specialties (multi-select)
    const specialtiesValues = formData.getAll("specialties") as string[]

    // Process underwriters (can be multiple)
    const underwriterCount = Number.parseInt((formData.get("underwriter_count") as string) || "0")
    const underwriters = []

    for (let i = 0; i < underwriterCount; i++) {
      const name = formData.get(`underwriter_name_${i}`) as string
      const phone = formData.get(`underwriter_phone_${i}`) as string
      const email = formData.get(`underwriter_email_${i}`) as string

      // Get lines of business for this underwriter (multi-select)
      const linesOfBusiness = formData.getAll(`underwriter_lines_${i}`) as string[]

      if (name || phone || email) {
        underwriters.push({
          name,
          phone,
          email,
          lines_of_business: linesOfBusiness,
        })
      }
    }

    // Set the first underwriter as the primary one for backward compatibility
    const primaryUnderwriter = underwriters[0] || { name: "", phone: "", email: "" }

    const { data, error } = await supabase
      .from("carrier_contacts")
      .update({
        insurance_carrier,
        producer_code,
        website_link,
        website_login,
        agency_user_id,
        password,
        customer_service_phone,
        billing_phone,
        agency_contact_name,
        agency_contact_number,
        agency_contact_email,

        // For backward compatibility
        underwriter_contact: primaryUnderwriter.name,
        underwriter_number: primaryUnderwriter.phone,
        underwriter_email: primaryUnderwriter.email,

        loss_run_request_link,
        claims_email,
        claims_phone_number,
        specialties: specialtiesValues,
        notes,
        underwriters,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error(`Error updating carrier contact with ID ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/carrier-contacts")
    revalidatePath(`/carrier-contacts/${id}`)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error(`Unexpected error updating carrier contact with ID ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteCarrierContact(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("carrier_contacts").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting carrier contact with ID ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/carrier-contacts")
    return { success: true }
  } catch (error) {
    console.error(`Unexpected error deleting carrier contact with ID ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
