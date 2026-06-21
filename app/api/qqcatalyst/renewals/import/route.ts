export const dynamic = "force-dynamic"
export const runtime = 'nodejs'
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { fetchPoliciesLastModified } from "@/lib/qqcatalyst/api-enhanced"

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Starting QQ renewals import for UPCOMING renewals only...")

    // Calculate date range: TODAY to 4 MONTHS from now (upcoming renewals only)
    const today = new Date()
    const fourMonthsFromNow = new Date(today)
    fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 12)

    console.log(`📅 Fetching policies expiring from ${today.toISOString().split('T')[0]} to ${fourMonthsFromNow.toISOString().split('T')[0]}`)

    // Fetch ALL policies using the working endpoint
    const response = await fetchPoliciesLastModified({
      startDate: "2017-01-01", // Get all policies from 2017 onwards
      endDate: new Date().toISOString().split('T')[0],
      pageSize: 500,
      pageNumber: 1,
    })

    if (!response.isSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: response.errorMessage || "Failed to fetch upcoming renewals from QQCatalyst",
          imported: 0,
          total: 0,
        },
        { status: 500 }
      )
    }

    const allPolicies = response.data || []
    console.log(`📝 Found ${allPolicies.length} total policies from QQCatalyst`)

    // Filter to only policies expiring in the next 12 months
    const policies = allPolicies.filter((policy: any) => {
      if (!policy.ExpirationDate) return false
      const expDate = new Date(policy.ExpirationDate)
      return expDate >= today && expDate <= fourMonthsFromNow
    })

    console.log(`📌 Filtered to ${policies.length} policies expiring in next 12 months`)

    if (policies.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        total: 0,
        totalAvailable: allPolicies.length,
        message: `No upcoming renewals found (policies expiring in the next 12 months). Found ${allPolicies.length} total policies in QQCatalyst.`,
      })
    }

    // Log sample policy to verify dates
    if (policies.length > 0) {
      console.log("📋 Sample policy:", {
        PolicyNumber: policies[0].PolicyNumber,
        ExpirationDate: policies[0].ExpirationDate,
        CustomerName: policies[0].CustomerName,
      })
    }

    // Transform policies to renewals format
    const transformedRenewals = policies.map((policy: any) => {
      const expirationDate = policy.ExpirationDate || null
      const effectiveDate = policy.EffectiveDate || null
      const policyId = policy.PolicyId || policy.ID

      // Determine status based on expiration date
      let status = "pending"
      if (expirationDate) {
        const expDate = new Date(expirationDate)
        const thirtyDaysFromNow = new Date(today)
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        
        if (expDate < today) {
          status = "expired"
        } else if (expDate <= thirtyDaysFromNow) {
          status = "urgent"
        } else {
          status = "pending"
        }
      }

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
        status: status,
        notes: `Imported from QQCatalyst (Upcoming Renewals) - Policy ID: ${policyId}`,
        json_raw: policy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Insert renewals into our database
    const { data, error } = await supabaseAdmin
      .from("renewals")
      .insert(transformedRenewals)
      .select()

    if (error) {
      console.error("❌ Database error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      throw new Error(`Database error: ${error.message}`)
    }

    console.log(`✅ Successfully imported ${data?.length || 0} upcoming renewals`)

    const totalAvailable = response.totalItems || policies.length
    const moreAvailable = totalAvailable > 500

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: policies.length,
      totalAvailable: totalAvailable,
      moreAvailable: moreAvailable,
      message: moreAvailable
        ? `Successfully imported ${data?.length || 0} upcoming renewals (500 limit reached, ${totalAvailable - 500} more available in next 12 months)`
        : `Successfully imported ${data?.length || 0} upcoming renewals (expiring in next 12 months)`,
    })
  } catch (error) {
    console.error("❌ Renewals import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during renewals import",
        imported: 0,
        total: 0,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
