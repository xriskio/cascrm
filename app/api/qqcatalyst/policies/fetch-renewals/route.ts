export const dynamic = "force-dynamic"
export const runtime = 'nodejs'
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { fetchPoliciesLastModified } from "@/lib/qqcatalyst/api-enhanced"

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, policyNumber, accountNumber, namedInsured } = await request.json()

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Start date and end date are required" },
        { status: 400 }
      )
    }

    console.log(`🚀 Fetching QQCatalyst policies...`)
    console.log(`📅 Date range: ${startDate} to ${endDate}`)
    if (policyNumber) console.log(`🔍 Policy Number filter: ${policyNumber}`)
    if (accountNumber) console.log(`🔍 Account Number filter: ${accountNumber}`)
    if (namedInsured) console.log(`🔍 Named Insured filter: ${namedInsured}`)

    // Fetch policies across all pages with reasonable limit
    // Use user's date range to minimize data fetched from QQCatalyst
    let allPolicies: any[] = []
    let currentPage = 1
    let totalPages = 1
    let totalItems = 0
    let hitSafetyLimit = false
    const MAX_PAGES = 100 // Increased to 100 pages (50,000 policies) for better coverage

    do {
      console.log(`📄 Fetching page ${currentPage} of ${totalPages || '?'}...`)
      
      // Use a wider date range for the API call to ensure we get all matching policies
      // QQCatalyst's LastModified endpoint uses last modification date, not expiration date
      // So we need to fetch a broader range and filter client-side
      const apiStartDate = new Date(startDate)
      apiStartDate.setFullYear(apiStartDate.getFullYear() - 2) // Go back 2 years before user's start date
      
      const apiEndDate = new Date(endDate)
      apiEndDate.setFullYear(apiEndDate.getFullYear() + 1) // Go forward 1 year after user's end date
      
      const response = await fetchPoliciesLastModified({
        startDate: apiStartDate.toISOString().split('T')[0],
        endDate: apiEndDate.toISOString().split('T')[0],
        pageSize: 500,
        pageNumber: currentPage,
      })

      if (!response.isSuccess) {
        return NextResponse.json(
          {
            success: false,
            message: response.errorMessage || "Failed to fetch policies from QQCatalyst",
            imported: 0,
            total: 0,
          },
          { status: 500 }
        )
      }

      allPolicies.push(...(response.data || []))
      totalPages = response.pagesTotal
      totalItems = response.totalItems
      currentPage++

      // Safety limit to prevent extreme timeouts
      if (currentPage > MAX_PAGES && currentPage <= totalPages) {
        hitSafetyLimit = true
        console.log(`⚠️ Reached safety limit of ${MAX_PAGES} pages (${MAX_PAGES * 500} policies). ${totalItems - (MAX_PAGES * 500)} policies not searched.`)
        break
      }
    } while (currentPage <= totalPages)

    const searchSummary = hitSafetyLimit 
      ? `Searched ${allPolicies.length} of ${totalItems} total policies (safety limit reached)`
      : `Searched all ${allPolicies.length} policies from QQCatalyst`
    
    console.log(`📝 ${searchSummary}`)

    // Apply filters
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    
    const filteredPolicies = allPolicies.filter((policy: any) => {
      // Filter by expiration date range
      if (!policy.ExpirationDate) return false
      const expDate = new Date(policy.ExpirationDate)
      if (expDate < startDateObj || expDate > endDateObj) return false

      // Filter by policy number (exact match)
      if (policyNumber && policy.PolicyNumber !== policyNumber) return false

      // Filter by account number (exact match)
      if (accountNumber && policy.AccountNumber !== accountNumber) return false

      // Filter by named insured (partial match, case-insensitive)
      if (namedInsured) {
        const customerName = (policy.CustomerName || "").toLowerCase()
        const searchTerm = namedInsured.toLowerCase()
        if (!customerName.includes(searchTerm)) return false
      }

      return true
    })

    console.log(`✅ Filtered to ${filteredPolicies.length} policies matching criteria`)

    if (filteredPolicies.length === 0) {
      const filterInfo = [
        policyNumber && `Policy: ${policyNumber}`,
        accountNumber && `Account: ${accountNumber}`,
        namedInsured && `Insured: ${namedInsured}`
      ].filter(Boolean).join(", ")
      
      const noResultsMessage = filterInfo 
        ? `No policies found matching filters (${filterInfo}) in date range ${startDate} to ${endDate}.`
        : `No policies found expiring between ${startDate} and ${endDate}.`
      
      const safetyWarning = hitSafetyLimit
        ? ` WARNING: Only searched ${allPolicies.length} of ${totalItems} total policies due to safety limit. More policies may exist.`
        : ` Searched all ${allPolicies.length} policies in QQCatalyst.`
      
      return NextResponse.json({
        success: true,
        imported: 0,
        total: 0,
        totalAvailable: totalItems,
        totalPoliciesSearched: allPolicies.length,
        hitSafetyLimit,
        message: noResultsMessage + safetyWarning,
      })
    }

    const policies = filteredPolicies

    // Transform policies to renewals format
    const transformedRenewals = policies.map((policy: any) => {
      const expirationDate = policy.ExpirationDate || null
      const effectiveDate = policy.EffectiveDate || null
      const policyId = policy.PolicyId || policy.ID

      // Determine if this is an upcoming renewal
      const isUpcomingRenewal = expirationDate ? new Date(expirationDate) > new Date() : false

      return {
        // Let Supabase generate UUID automatically
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
        status: isUpcomingRenewal ? "pending" : "expired",
        notes: `Imported from QQCatalyst (${startDate} to ${endDate}) - Policy ID: ${policyId}`,
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
      // Log full Postgres error details for debugging
      console.error("❌ Database error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      throw new Error(`Database error: ${error.message}`)
    }

    console.log(`✅ Successfully imported ${data?.length || 0} renewals`)

    const responseMessage = hitSafetyLimit
      ? `Successfully imported ${data?.length || 0} renewals. WARNING: Only searched ${allPolicies.length} of ${totalItems} policies due to safety limit. Some policies may not have been included.`
      : `Successfully imported ${data?.length || 0} renewals from QQCatalyst (searched all ${allPolicies.length} policies)`

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: policies.length,
      totalAvailable: totalItems,
      totalPoliciesSearched: allPolicies.length,
      hitSafetyLimit,
      message: responseMessage,
    })
  } catch (error) {
    console.error("❌ Renewals import failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during renewals import",
        imported: 0,
        total: 0,
      },
      { status: 500 },
    )
  }
}
