export const dynamic = "force-dynamic"
export const runtime = 'nodejs'
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { fetchPoliciesLastModified } from "@/lib/qqcatalyst/api-enhanced"

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json()

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Start date and end date are required" },
        { status: 400 }
      )
    }

    const filterStart = new Date(startDate)
    const filterEnd = new Date(endDate)

    console.log(`🚀 Importing QQCatalyst renewals expiring ${startDate} to ${endDate}...`)

    // Fetch all policies via LastModifiedCreated (wide window) and filter by expiration date
    const allPolicies: any[] = []
    let currentPage = 1
    let totalPages = 1

    do {
      const response = await fetchPoliciesLastModified({
        startDate: "2010-01-01",
        endDate: "2030-12-31",
        pageNumber: currentPage,
        pageSize: 500,
      })

      if (!response.isSuccess && currentPage === 1) {
        return NextResponse.json(
          { success: false, message: "Failed to fetch policies from QQCatalyst" },
          { status: 500 }
        )
      }

      totalPages = response.pagesTotal || 1
      allPolicies.push(...(response.data || []))
      currentPage++

      // Safety cap at 10 pages (5,000 records)
      if (currentPage > 10) break
    } while (currentPage <= totalPages)

    console.log(`📊 Retrieved ${allPolicies.length} total policies from QQCatalyst`)

    // Filter to only policies whose ExpirationDate falls within the requested window
    const filtered = allPolicies.filter((policy: any) => {
      if (!policy.ExpirationDate) return false
      const expDate = new Date(policy.ExpirationDate)
      return expDate >= filterStart && expDate <= filterEnd
    })

    console.log(`📝 Found ${filtered.length} policies expiring between ${startDate} and ${endDate}`)

    if (filtered.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        total: 0,
        message: "No policies found expiring in the selected date range",
      })
    }

    // Transform to renewals format
    const transformedRenewals = filtered.map((policy: any) => {
      const expirationDate = policy.ExpirationDate || null
      const effectiveDate = policy.EffectiveDate || null
      const policyId = policy.PolicyId || policy.ID

      const isUpcoming = expirationDate ? new Date(expirationDate) > new Date() : false

      return {
        policy_id: String(policyId),
        policy_number: policy.PolicyNumber || "",
        client_name: policy.CustomerName || "Unknown",
        insured_name: policy.CustomerName || null,
        business_name: policy.CustomerName || null,
        policy_type: policy.LOB || policy.PolicyType || "Unknown",
        carrier: policy.WritingCarrier || null,
        effective_date: effectiveDate,
        expiration_date: expirationDate,
        premium: policy.TotalPremium || null,
        policy_premium: policy.TotalPremium || null,
        agent_name: policy.AgentName || null,
        source: "qqcatalyst",
        external_id: String(policyId),
        status: isUpcoming ? "pending" : "expired",
        notes: `Imported from QQCatalyst - Policy ID: ${policyId}`,
        json_raw: policy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Insert into Supabase - duplicates are prevented by unique renewal_id constraint
    console.log(`📝 Attempting to insert ${transformedRenewals.length} renewals...`)
    const { data, error } = await supabaseAdmin
      .from("renewals")
      .insert(transformedRenewals)
      .select()

    console.log(`📊 Upsert response - data length: ${data?.length || 0}, error: ${error ? error.message : 'none'}`)

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully imported ${data?.length || 0} renewals`)

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: filtered.length,
      message: `Successfully imported ${data?.length || 0} renewals from QQCatalyst`,
    })
  } catch (error) {
    console.error("❌ Renewals import failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during renewals import",
      },
      { status: 500 },
    )
  }
}
