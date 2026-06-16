"use server"

import { createClient } from "@/lib/supabase/server"

export interface SearchResult {
  id: string
  type: "submission" | "renewal" | "client" | "call" | "carrier" | "user"
  title: string
  subtitle?: string
  description?: string
  url: string
  metadata?: Record<string, any>
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const supabase = await createClient()
    const searchTerm = `%${query.toLowerCase()}%`
    const results: SearchResult[] = []

    // Search submissions
    const { data: submissions } = await supabase
      .from("submissions")
      .select("id, insured_name, policy_number, email, phone, company_name, line_of_business")
      .or(
        `insured_name.ilike.${searchTerm},policy_number.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},company_name.ilike.${searchTerm}`,
      )
      .limit(10)

    submissions?.forEach((submission) => {
      results.push({
        id: submission.id,
        type: "submission",
        title: submission.insured_name || submission.company_name || "Unnamed Submission",
        subtitle: submission.policy_number || submission.line_of_business,
        description: `${submission.email || ""} ${submission.phone || ""}`.trim(),
        url: `/submissions/view/${submission.id}`,
        metadata: submission,
      })
    })

    // Search renewals
    const { data: renewals } = await supabase
      .from("renewals")
      .select("id, insured_name, policy_number, email, phone, company_name, line_of_business")
      .or(
        `insured_name.ilike.${searchTerm},policy_number.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},company_name.ilike.${searchTerm}`,
      )
      .limit(10)

    renewals?.forEach((renewal) => {
      results.push({
        id: renewal.id,
        type: "renewal",
        title: renewal.insured_name || renewal.company_name || "Unnamed Renewal",
        subtitle: renewal.policy_number || renewal.line_of_business,
        description: `${renewal.email || ""} ${renewal.phone || ""}`.trim(),
        url: `/renewals/${renewal.id}`,
        metadata: renewal,
      })
    })

    // Search clients
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, email, phone, company_name")
      .or(
        `name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},company_name.ilike.${searchTerm}`,
      )
      .limit(10)

    clients?.forEach((client) => {
      results.push({
        id: client.id,
        type: "client",
        title: client.name || client.company_name || "Unnamed Client",
        subtitle: "Client",
        description: `${client.email || ""} ${client.phone || ""}`.trim(),
        url: `/clients/${client.id}`,
        metadata: client,
      })
    })

    // Search users/agents
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role")
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
      .limit(10)

    users?.forEach((user) => {
      results.push({
        id: user.id,
        type: "user",
        title: user.full_name || "Unnamed User",
        subtitle: user.role || "User",
        description: `${user.email || ""} ${user.phone || ""}`.trim(),
        url: `/admin/users/${user.id}`,
        metadata: user,
      })
    })

    // Search call logs
    const { data: calls } = await supabase
      .from("incoming_calls")
      .select("id, name, company_name, phone_number, email, reason_for_call")
      .or(
        `name.ilike.${searchTerm},company_name.ilike.${searchTerm},phone_number.ilike.${searchTerm},email.ilike.${searchTerm}`,
      )
      .limit(10)

    calls?.forEach((call) => {
      results.push({
        id: call.id,
        type: "call",
        title: call.name || call.company_name || "Unnamed Caller",
        subtitle: call.reason_for_call || "Call Log",
        description: `${call.email || ""} ${call.phone_number || ""}`.trim(),
        url: `/call-log/${call.id}`,
        metadata: call,
      })
    })

    // Search carrier contacts
    const { data: carriers } = await supabase
      .from("carrier_contacts")
      .select("id, name, email, phone, company, title")
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},company.ilike.${searchTerm}`)
      .limit(10)

    carriers?.forEach((carrier) => {
      results.push({
        id: carrier.id,
        type: "carrier",
        title: carrier.name || "Unnamed Contact",
        subtitle: `${carrier.company || ""} ${carrier.title || ""}`.trim(),
        description: `${carrier.email || ""} ${carrier.phone || ""}`.trim(),
        url: `/carrier-contacts/${carrier.id}`,
        metadata: carrier,
      })
    })

    return results.slice(0, 20) // Limit total results
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}
