import { createClient } from "@supabase/supabase-js"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import axios from "axios"

const QQ_API = "https://api.qqcatalyst.com/v1"
const OAUTH_URL = "https://login.qqcatalyst.com/oauth/token"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getToken() {
  try {
    const params = new URLSearchParams({
      grant_type: "password_credentials",
      client_id: process.env.QQ_CLIENT_ID!,
      client_secret: process.env.QQ_CLIENT_SECRET!,
      username: process.env.QQ_USERNAME!,
      password: process.env.QQ_PASSWORD!,
    })

    const response = await axios.post(OAUTH_URL, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })

    return response.data.access_token
  } catch (error) {
    console.error("Error getting QQCatalyst token:", error)
    throw new Error("Failed to authenticate with QQCatalyst")
  }
}

async function fetchPolicies(token: string) {
  try {
    const policies = []
    let page = 1
    const pageSize = 100

    while (true) {
      console.log(`Fetching policies page ${page}...`)
      const response = await axios.get(
        `${QQ_API}/Policies/LastModifiedCreated?startDate=2000-01-01&endDate=2099-12-31&pageNumber=${page}&pageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const items = response.data.Policies || []
      if (!items.length) break

      policies.push(...items)
      page++

      // Safety limit
      if (page > 20) break
    }

    return policies
  } catch (error) {
    console.error("Error fetching policies:", error)
    throw new Error("Failed to fetch policies from QQCatalyst")
  }
}

async function fetchPolicyDetails(token: string, policyId: number) {
  try {
    const response = await axios.get(`${QQ_API}/Policies/${policyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching details for policy ${policyId}:`, error)
    return null
  }
}

async function fetchCustomerDetails(token: string, customerId: number) {
  try {
    const response = await axios.get(`${QQ_API}/Contacts/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching details for customer ${customerId}:`, error)
    return null
  }
}

export async function GET() {
  try {
    console.log("Starting QQCatalyst renewals import...")
    const token = await getToken()
    console.log("Authentication successful, fetching policies...")

    const policies = await fetchPolicies(token)
    console.log(`Found ${policies.length} policies, processing renewals...`)

    const renewals = []
    let processedCount = 0
    let successCount = 0

    for (const policy of policies) {
      try {
        processedCount++

        // Only process policies with expiration dates in the future or recent past
        const expirationDate = new Date(policy.ExpirationDate)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        if (expirationDate < threeMonthsAgo) {
          continue // Skip policies that expired more than 3 months ago
        }

        // Get additional details
        const policyDetails = await fetchPolicyDetails(token, policy.PolicyID)
        const customerDetails = policy.CustomerID ? await fetchCustomerDetails(token, policy.CustomerID) : null

        // Create renewal object
        const renewal = {
          id: `qq-${policy.PolicyID}`,
          policy_number: policy.PolicyNumber,
          client_name: customerDetails ? `${customerDetails.FirstName} ${customerDetails.LastName}` : null,
          insured_name: policy.InsuredName || null,
          renewal_date: policy.RenewalDate || policy.ExpirationDate,
          expiration_date: policy.ExpirationDate,
          status: policy.Status || "Pending",
          insurance_carrier: policy.InsuranceCompanyName || policy.CarrierName,
          policy_type: policy.LineOfBusiness || policy.PolicyType,
          expiring_premium: policy.Premium || null,
          renewal_premium: policy.RenewalPremium || policy.Premium || null,
          producer: policy.ProducerName || null,
          retail_agency_name: policy.AgencyName || null,
          created_at: new Date().toISOString(),
          imported_from: "QQCatalyst",
          qq_policy_id: policy.PolicyID,
          qq_customer_id: policy.CustomerID,
          json_raw: policy,
        }

        renewals.push(renewal)
        successCount++

        // Log progress every 10 policies
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount}/${policies.length} policies...`)
        }
      } catch (error) {
        console.error(`Error processing policy ${policy.PolicyID}:`, error)
      }
    }

    console.log(`Successfully processed ${successCount} renewals, inserting into database...`)

    // Insert renewals into database
    if (renewals.length > 0) {
      const { error } = await supabase.from("renewals").upsert(renewals, {
        onConflict: "id",
      })

      if (error) {
        console.error("Error inserting renewals:", error)
        return NextResponse.json(
          { success: false, message: "Error inserting renewals", error: error.message },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${renewals.length} renewals from QQCatalyst`,
      count: renewals.length,
    })
  } catch (error) {
    console.error("QQCatalyst renewals import failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "QQCatalyst renewals import failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET()
}
