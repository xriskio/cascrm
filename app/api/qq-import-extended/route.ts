import { createClient } from "@supabase/supabase-js"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import axios from "axios"

const QQ_API = "https://api.qqcatalyst.com/v1"
const OAUTH_URL = "https://login.qqcatalyst.com/oauth/token"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getToken() {
  const params = new URLSearchParams({
    grant_type: "password_credentials",
    client_id: process.env.QQ_CLIENT_ID!,
    client_secret: process.env.QQ_CLIENT_SECRET!,
    username: process.env.QQ_USERNAME!,
    password: process.env.QQ_PASSWORD!,
  })

  const { data } = await axios.post(OAUTH_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  return data.access_token as string
}

async function fetchAll<T>(path: string, token: string): Promise<T[]> {
  const all: T[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    try {
      const res = await axios.get<{ items: T[] }>(`${QQ_API}/${path}?pageNumber=${page}&pageSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const items = (res.data as any).items ?? res.data.Contacts ?? res.data.Policies ?? []
      if (!items.length) break
      all.push(...items)
      page++

      // Safety limit
      if (page > 50) break
    } catch (error) {
      console.log(`⚠️ Error fetching ${path} page ${page}:`, error)
      break
    }
  }
  return all
}

// Core data functions
async function upsertContacts(token: string) {
  type QQContact = {
    ContactID: number
    FirstName: string
    LastName: string
    Email: string
    Phone: string
    LastModifiedDate: string
  }

  console.log("🔄 Fetching contacts...")
  const contacts = await fetchAll<QQContact>("Contacts/LastModifiedCreated", token)

  const rows = contacts.map((c) => ({
    id: c.ContactID,
    first_name: c.FirstName,
    last_name: c.LastName,
    email: c.Email,
    phone: c.Phone,
    json_raw: c,
    updated_at: c.LastModifiedDate,
  }))

  if (rows.length > 0) {
    const { error } = await supabase.from("contacts").upsert(rows, { onConflict: "id" })
    if (error) {
      console.error("❌ contacts upsert error", error)
      throw error
    }
    console.log(`✅ upserted ${rows.length} contacts`)
  }

  return rows.length
}

async function upsertPolicies(token: string) {
  type QQPolicy = {
    PolicyID: number
    CustomerID: number
    PolicyNumber: string
    LineOfBusiness: string
    LastModifiedDate: string
  }

  console.log("🔄 Fetching policies...")
  const policies = await fetchAll<QQPolicy>("Policies/LastModifiedCreated", token)

  const rows = policies.map((p) => ({
    id: p.PolicyID,
    contact_id: p.CustomerID,
    policy_number: p.PolicyNumber,
    line_of_business: p.LineOfBusiness,
    json_raw: p,
    updated_at: p.LastModifiedDate,
  }))

  if (rows.length > 0) {
    const { error } = await supabase.from("policies").upsert(rows, { onConflict: "id" })
    if (error) {
      console.error("❌ policies upsert error", error)
      throw error
    }
    console.log(`✅ upserted ${rows.length} policies`)
  }

  return rows.length
}

// Phone numbers
async function upsertPhoneNumbers(token: string) {
  type QQPhone = {
    ContactID: number
    Number: string
    Type: string
    LastModified: string
  }

  console.log("🔄 Fetching phone numbers...")
  try {
    const phones = await fetchAll<QQPhone>("Contacts/{contactID}/PhoneNumbers", token)
    const rows = phones.map((p) => ({
      contact_id: p.ContactID,
      number: p.Number,
      type: p.Type,
      modified_at: p.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase
        .from("contact_phone_numbers")
        .upsert(rows, { onConflict: ["contact_id", "number"] })
      if (error) {
        console.error("❌ phones error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} phone numbers`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Phone numbers endpoint not available:", error)
    return 0
  }
}

// Emails
async function upsertEmails(token: string) {
  type QQEmail = {
    ContactID: number
    Email: string
    Type: string
    LastModified: string
  }

  console.log("🔄 Fetching emails...")
  try {
    const emails = await fetchAll<QQEmail>("Contacts/{contactID}/Emails", token)
    const rows = emails.map((e) => ({
      contact_id: e.ContactID,
      email: e.Email,
      type: e.Type,
      modified_at: e.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("contact_emails").upsert(rows, { onConflict: ["contact_id", "email"] })
      if (error) {
        console.error("❌ emails error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} emails`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Emails endpoint not available:", error)
    return 0
  }
}

// Notes
async function upsertNotes(token: string) {
  type QQNote = {
    NoteID: number
    ContactID: number
    Content: string
    Created: string
    Modified: string
  }

  console.log("🔄 Fetching notes...")
  try {
    const notes = await fetchAll<QQNote>("Contacts/{contactID}/Notes", token)
    const rows = notes.map((n) => ({
      note_id: n.NoteID,
      contact_id: n.ContactID,
      content: n.Content,
      created_at: n.Created,
      modified_at: n.Modified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("contact_notes").upsert(rows, { onConflict: "note_id" })
      if (error) {
        console.error("❌ notes error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} notes`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Notes endpoint not available:", error)
    return 0
  }
}

// Billing
async function upsertBilling(token: string) {
  type QQBill = {
    ContactID: number
    Type: string
    Amount: number
    Date: string
    LastModified: string
  }

  console.log("🔄 Fetching billing records...")
  try {
    const bills = await fetchAll<QQBill>("Customers/{contactID}/Billing/Customer", token)
    const rows = bills.map((b, index) => ({
      id: Number.parseInt(`${b.ContactID}${index}`), // Generate unique ID
      contact_id: b.ContactID,
      billing_type: b.Type,
      amount: b.Amount,
      date: b.Date,
      modified_at: b.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("customer_billing").upsert(rows, { onConflict: "id" })
      if (error) {
        console.error("❌ billing error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} billing records`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Billing endpoint not available:", error)
    return 0
  }
}

// ACORD Forms
async function upsertAcordForms(token: string) {
  type QQForm = {
    ACORDFormID: number
    CustomerID: number
    PolicyID: number
    Description: string
    TemplateID: number
    DataObject: any
    LastModified: string
  }

  console.log("🔄 Fetching ACORD forms...")
  try {
    const forms = await fetchAll<QQForm>("ACORDForms/ByCustomer/{customerID}", token)
    const rows = forms.map((f) => ({
      form_id: f.ACORDFormID,
      customer_id: f.CustomerID,
      policy_id: f.PolicyID,
      description: f.Description,
      template_id: f.TemplateID,
      data_json: f.DataObject,
      modified_at: f.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("acord_forms").upsert(rows, { onConflict: "form_id" })
      if (error) {
        console.error("❌ ACORD forms error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} ACORD forms`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ ACORD forms endpoint not available:", error)
    return 0
  }
}

// Renewals
async function upsertRenewals(token: string) {
  type QQRenewal = {
    PolicyID: number
    RenewalDate: string
    AnnualPremium: number
  }

  console.log("🔄 Fetching renewals...")
  try {
    const renewals = await fetchAll<QQRenewal>("PolicySummaryForApi", token)
    const rows = renewals.map((r) => ({
      policy_id: r.PolicyID,
      renewal_date: r.RenewalDate,
      premium: r.AnnualPremium,
    }))

    if (rows.length > 0) {
      const { error } = await supabase
        .from("policy_renewals")
        .upsert(rows, { onConflict: ["policy_id", "renewal_date"] })
      if (error) {
        console.error("❌ renewals error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} renewals`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Renewals endpoint not available:", error)
    return 0
  }
}

// Locations
async function upsertLocations(token: string) {
  type QQLoc = {
    PolicyDetailID: number
    LocationID: number
    AddressLine1: string
    City: string
    State: string
    PostalCode: string
    LastModified: string
  }

  console.log("🔄 Fetching locations...")
  try {
    // Try multiple location endpoints
    const endpoints = [
      "Policies/Details/{policyDetailID}/Homeowners/Locations",
      "Policies/Details/{policyDetailID}/CommercialLocations",
    ]

    let allLocations: QQLoc[] = []
    for (const endpoint of endpoints) {
      try {
        const locations = await fetchAll<QQLoc>(endpoint, token)
        allLocations = [...allLocations, ...locations]
      } catch (error) {
        console.log(`⚠️ ${endpoint} not available`)
      }
    }

    const rows = allLocations.map((l) => ({
      id: l.LocationID,
      policy_id: l.PolicyDetailID,
      address_line1: l.AddressLine1,
      city: l.City,
      state: l.State,
      postal_code: l.PostalCode,
      location_type: "Property",
      modified_at: l.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("policy_locations").upsert(rows, { onConflict: "id" })
      if (error) {
        console.error("❌ locations error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} locations`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Locations endpoints not available:", error)
    return 0
  }
}

// Vehicles
async function upsertVehicles(token: string) {
  type QQVeh = {
    PolicyDetailID: number
    VehicleID: number
    Year: number
    Make: string
    Model: string
    VIN: string
    LastModified: string
  }

  console.log("🔄 Fetching vehicles...")
  try {
    const vehicles = await fetchAll<QQVeh>("Policies/Details/{policyDetailID}/CommercialAuto/Vehicles", token)
    const rows = vehicles.map((v) => ({
      id: v.VehicleID,
      policy_detail_id: v.PolicyDetailID,
      policy_id: v.PolicyDetailID, // You may need to lookup actual policy_id
      year: v.Year,
      make: v.Make,
      model: v.Model,
      vin: v.VIN,
      modified_at: v.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("commercial_vehicles").upsert(rows, { onConflict: "id" })
      if (error) {
        console.error("❌ vehicles error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} vehicles`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Vehicles endpoint not available:", error)
    return 0
  }
}

async function importAll() {
  console.log("🚀 Starting extended QQCatalyst import...")
  const token = await getToken()

  // Core data
  const contactsCount = await upsertContacts(token)
  const policiesCount = await upsertPolicies(token)

  // Contact details
  const phoneNumbersCount = await upsertPhoneNumbers(token)
  const emailsCount = await upsertEmails(token)
  const notesCount = await upsertNotes(token)

  // Business data
  const billingCount = await upsertBilling(token)
  const acordFormsCount = await upsertAcordForms(token)

  // Policy details
  const renewalsCount = await upsertRenewals(token)
  const locationsCount = await upsertLocations(token)
  const vehiclesCount = await upsertVehicles(token)

  console.log("🎉 Extended QQCatalyst import complete")

  return {
    contactsImported: contactsCount,
    policiesImported: policiesCount,
    phoneNumbersImported: phoneNumbersCount,
    emailsImported: emailsCount,
    notesImported: notesCount,
    billingRecordsImported: billingCount,
    acordFormsImported: acordFormsCount,
    renewalsImported: renewalsCount,
    locationsImported: locationsCount,
    vehiclesImported: vehiclesCount,
  }
}

export async function POST() {
  try {
    const results = await importAll()

    return NextResponse.json({
      success: true,
      message: "Extended QQCatalyst import completed successfully",
      data: results,
    })
  } catch (error) {
    console.error("Extended import failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST()
}
