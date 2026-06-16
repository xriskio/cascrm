import { createClient } from "@supabase/supabase-js"

const QQ_API_URL = process.env.QQCATALYST_API_URL!
const QQ_BEARER_TOKEN = process.env.QQCATALYST_BEARER_TOKEN!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fetchPolicies(pageNumber: number = 1) {
  // Fetch all policies (wide date range to get everything)
  const params = new URLSearchParams({
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    pageNumber: pageNumber.toString(),
    pageSize: "100",
  })
  
  const url = `${QQ_API_URL}/Policies/LastModifiedCreated?${params}`
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${QQ_BEARER_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`QQ API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

function isWithinRenewalWindow(expirationDate: string | null): boolean {
  if (!expirationDate) return false
  
  const expDate = new Date(expirationDate)
  const startDate = new Date("2025-09-01")
  const endDate = new Date("2026-02-28")
  
  return expDate >= startDate && expDate <= endDate
}

function parseDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date.toISOString()
  } catch {
    return null
  }
}

async function main() {
  console.log("🚀 Starting QQCatalyst renewals import (Sept 1, 2025 - Feb 28, 2026)...")

  // Fetch first page to get total count
  const firstPage = await fetchPolicies(1)
  const totalPages = firstPage.PagesTotal || 1
  const totalItems = firstPage.TotalItems || 0
  console.log(`📊 Found ${totalItems} renewal policies across ${totalPages} pages\n`)

  let totalProcessed = 0

  // Loop through all pages
  for (let page = 1; page <= totalPages; page++) {
    console.log(`📥 Fetching page ${page}/${totalPages}...`)
    const response = await fetchPolicies(page)
    const policies = response.Data || []
    
    if (policies.length === 0) {
      console.log("   No policies on this page, skipping...")
      continue
    }

    // Process policies and filter by expiration date (Sept 1, 2025 - Feb 28, 2026)
    const policyMap = new Map()
    
    policies.forEach((policy: any) => {
      const policyId = String(policy.PolicyId)
      
      // Only import policies expiring between Sept 1, 2025 and Feb 28, 2026
      if (!isWithinRenewalWindow(policy.ExpirationDate)) {
        return
      }
      
      if (!policyMap.has(policyId)) {
        policyMap.set(policyId, {
          qq_policy_id: policyId,
          policy_number: policy.PolicyNumber || null,
          named_insured: policy.CustomerName || "Unknown Client",
          policy_type: policy.PolicyType || null,
          lob: policy.LOB || null,
          effective_date: parseDate(policy.EffectiveDate),
          expiration_date: parseDate(policy.ExpirationDate),
          renewal_date: parseDate(policy.ExpirationDate),
          premium: policy.TotalPremium || null,
          total_premium: policy.TotalPremium || null,
          insurance_company: policy.WritingCarrier || null,
          carrier: policy.WritingCarrier || null,
          agent_name: policy.AgentName || null,
          mga: policy.MGA || null,
          status: "pending",
          archived: false,
        })
      }
    })
    
    const policyRecords = Array.from(policyMap.values())

    // Insert in small batches (20 at a time)
    let pageProcessed = 0
    const batchSize = 20

    for (let i = 0; i < policyRecords.length; i += batchSize) {
      const batch = policyRecords.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from("renewals")
        .upsert(batch, {
          onConflict: "qq_policy_id",
        })

      if (error) {
        console.error(`   ❌ Error in batch:`, error.message)
        continue
      }

      pageProcessed += batch.length
      totalProcessed += batch.length
    }

    console.log(`   ✅ Imported ${pageProcessed} policies (${totalProcessed}/${totalItems} total)`)
    
    // Small delay to avoid overwhelming the API/database
    if (page < totalPages) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`\n✨ COMPLETE! Successfully imported ${totalProcessed} renewals (Sept 2025 - Feb 2026) from QQCatalyst`)
}

main().catch((error) => {
  console.error("\n❌ IMPORT FAILED:", error)
  process.exit(1)
})
