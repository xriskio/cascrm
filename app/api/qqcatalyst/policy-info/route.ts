export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { qqcatalystRequest } from "@/lib/qqcatalyst/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const policyID = searchParams.get("policyID")

    if (!policyID) {
      return NextResponse.json({ error: "policyID parameter is required" }, { status: 400 })
    }

    const policyInfo = await qqcatalystRequest(`Policies/${policyID}/PolicyInfo`, "GET")

    return NextResponse.json(policyInfo)
  } catch (error) {
    console.error("Error fetching policy info:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch policy info" },
      { status: error.response?.status || 500 },
    )
  }
}
