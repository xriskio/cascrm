export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { qqcatalystRequest } from "@/lib/qqcatalyst/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")
    const keyword = searchParams.get("keyword") || ""
    const page = searchParams.get("page") || "1"
    const rowCount = searchParams.get("rowCount") || "10"

    if (!customerId) {
      return NextResponse.json({ error: "customerId parameter is required" }, { status: 400 })
    }

    const policies = await qqcatalystRequest(
      `Policies/ByCustomer/${customerId}?keyword=${keyword}&page=${page}&rowCount=${rowCount}`,
      "GET",
    )

    return NextResponse.json(policies)
  } catch (error) {
    console.error("Error fetching policies:", error)
    return NextResponse.json(
      { error: (error as any).message || "Failed to fetch policies" },
      { status: (error as any).response?.status || 500 },
    )
  }
}
