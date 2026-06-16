import { NextResponse } from "next/server"
import { QQCatalystClient } from "@/lib/qqcatalyst/client"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { policyId } = await request.json()

    if (!policyId) {
      return NextResponse.json({ success: false, error: "Policy ID is required" }, { status: 400 })
    }

    console.log(`🔍 Fetching details for policy ${policyId} from QQCatalyst...`)

    // Initialize QQCatalyst client
    const qqClient = new QQCatalystClient()
    await qqClient.getToken()

    // Fetch policy details using PolicyInfo endpoint
    const policyDetails = await qqClient.request(`Policies/${policyId}/PolicyInfo`, "GET")

    if (!policyDetails) {
      return NextResponse.json({ success: false, error: "Policy not found" }, { status: 404 })
    }

    console.log(`✅ Found policy details for ${policyId}`)

    return NextResponse.json({
      success: true,
      policy: policyDetails,
    })
  } catch (error) {
    console.error("❌ Error fetching policy details from QQCatalyst:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch policy details",
      },
      { status: 500 }
    )
  }
}
