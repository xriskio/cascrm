import { createClient } from "@supabase/supabase-js"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { upsertContacts, upsertPolicies, upsertRenewals, upsertLocations, upsertVehicles } from "./previous-functions" // Assuming these functions are in a separate file

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

  const response = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Auth failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  return data.access_token as string
}

async function fetchAll<T>(path: string, token: string): Promise<T[]> {
  const all: T[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    const url = `${QQ_API}/${path}?pageNumber=${page}&pageSize=${pageSize}`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Endpoint ${path} not found (404)`)
        break
      }
      const text = await response.text()
      throw new Error(`API request failed: ${response.status} ${text}`)
    }

    const data = await response.json()
    const items = (data as any).items ?? data.Contacts ?? data.Policies ?? []

    if (!items.length) break
    all.push(...items)
    page++

    // Safety limit
    if (page > 50) break
  }

  return all
}

async function upsertContactPhoneNumbers(token: string) {
  type QQContactPhone = {
    ContactID: number
    PhoneNumber: string
    PhoneType: string
    LastModified: string
  }

  console.log("🔄 Fetching contact phone numbers...")
  try {
    const phoneNumbers = await fetchAll<QQContactPhone>("ContactPhoneNumbers/LastModifiedCreated", token)

    const rows = phoneNumbers.map((p) => ({
      contact_id: p.ContactID,
      number: p.PhoneNumber,
      type: p.PhoneType,
      modified_at: p.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase
        .from("contact_phone_numbers")
        .upsert(rows, { onConflict: ["contact_id", "number"] })

      if (error) {
        console.error("❌ contact phone numbers upsert error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} contact phone numbers`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Contact phone numbers endpoint not available:", error)
    return 0
  }
}

async function upsertContactEmails(token: string) {
  type QQContactEmail = {
    ContactID: number
    EmailAddress: string
    EmailType: string
    LastModified: string
  }

  console.log("🔄 Fetching contact emails...")
  try {
    const emails = await fetchAll<QQContactEmail>("ContactEmails/LastModifiedCreated", token)

    const rows = emails.map((e) => ({
      contact_id: e.ContactID,
      email: e.EmailAddress,
      type: e.EmailType,
      modified_at: e.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("contact_emails").upsert(rows, { onConflict: ["contact_id", "email"] })

      if (error) {
        console.error("❌ contact emails upsert error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} contact emails`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Contact emails endpoint not available:", error)
    return 0
  }
}

async function upsertContactNotes(token: string) {
  type QQContactNote = {
    NoteID: number
    ContactID: number
    NoteContent: string
    CreatedDate: string
    LastModified: string
  }

  console.log("🔄 Fetching contact notes...")
  try {
    const notes = await fetchAll<QQContactNote>("ContactNotes/LastModifiedCreated", token)

    const rows = notes.map((n) => ({
      note_id: n.NoteID,
      contact_id: n.ContactID,
      content: n.NoteContent,
      created_at: n.CreatedDate,
      modified_at: n.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("contact_notes").upsert(rows, { onConflict: "note_id" })

      if (error) {
        console.error("❌ contact notes upsert error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} contact notes`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Contact notes endpoint not available:", error)
    return 0
  }
}

async function upsertCustomerBilling(token: string) {
  type QQBilling = {
    BillingID: number
    CustomerID: number
    BillingType: string
    Amount: number
    BillingDate: string
    LastModified: string
  }

  console.log("🔄 Fetching customer billing...")
  try {
    const billingRecords = await fetchAll<QQBilling>("CustomerBilling/LastModifiedCreated", token)

    const rows = billingRecords.map((b) => ({
      id: b.BillingID,
      contact_id: b.CustomerID,
      billing_type: b.BillingType,
      amount: b.Amount,
      date: b.BillingDate,
      modified_at: b.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("customer_billing").upsert(rows, { onConflict: "id" })

      if (error) {
        console.error("❌ customer billing upsert error", error)
        throw error
      }
      console.log(`✅ upserted ${rows.length} customer billing records`)
    }

    return rows.length
  } catch (error) {
    console.log("⚠️ Customer billing endpoint not available:", error)
    return 0
  }
}

async function upsertAcordForms(token: string) {
  type QQAcordForm = {
    FormID: number
    CustomerID: number
    PolicyID: number
    Description: string
    TemplateID: number
    FormData: any
    LastModified: string
  }

  console.log("🔄 Fetching ACORD forms...")
  try {
    const forms = await fetchAll<QQAcordForm>("AcordForms/LastModifiedCreated", token)

    const rows = forms.map((f) => ({
      form_id: f.FormID,
      customer_id: f.CustomerID,
      policy_id: f.PolicyID,
      description: f.Description,
      template_id: f.TemplateID,
      data_json: f.FormData,
      modified_at: f.LastModified,
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("acord_forms").upsert(rows, { onConflict: "form_id" })

      if (error) {
        console.error("❌ ACORD forms upsert error", error)
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

async function importAll() {
  console.log("🚀 Starting complete QQCatalyst import...")
  const token = await getToken()

  // Core data
  const contactsCount = await upsertContacts(token)
  const policiesCount = await upsertPolicies(token)

  // Extended data
  const renewalsCount = await upsertRenewals(token)
  const locationsCount = await upsertLocations(token)
  const vehiclesCount = await upsertVehicles(token)

  // Contact details
  const phoneNumbersCount = await upsertContactPhoneNumbers(token)
  const emailsCount = await upsertContactEmails(token)
  const notesCount = await upsertContactNotes(token)

  // Business data
  const billingCount = await upsertCustomerBilling(token)
  const acordFormsCount = await upsertAcordForms(token)

  console.log("🎉 Complete QQCatalyst import finished")

  return {
    contactsImported: contactsCount,
    policiesImported: policiesCount,
    renewalsImported: renewalsCount,
    locationsImported: locationsCount,
    vehiclesImported: vehiclesCount,
    phoneNumbersImported: phoneNumbersCount,
    emailsImported: emailsCount,
    notesImported: notesCount,
    billingRecordsImported: billingCount,
    acordFormsImported: acordFormsCount,
  }
}

export async function POST() {
  try {
    const results = await importAll()

    return NextResponse.json({
      success: true,
      message: "Complete QQCatalyst import finished successfully",
      data: results,
    })
  } catch (error) {
    console.error("Import failed:", error)

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
