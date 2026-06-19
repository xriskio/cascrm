export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { qqcatalystRequest } from "@/lib/qqcatalyst/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerID = searchParams.get("customerID")

    if (!customerID) {
      return NextResponse.json({ error: "customerID parameter is required" }, { status: 400 })
    }

    const accountInfo = await qqcatalystRequest(`Contacts/${customerID}/AccountInfo`, "GET")

    return NextResponse.json(accountInfo)
  } catch (error) {
    console.error("Error fetching account info:", error)
    return NextResponse.json(
      { error: (error as any).message || "Failed to fetch account info" },
      { status: (error as any).response?.status || 500 },
    )
  }
}
