import { type NextRequest, NextResponse } from "next/server"
import { qqcatalystRequest } from "@/lib/qqcatalyst/client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchString = searchParams.get("searchString")
    const locationID = searchParams.get("locationID")

    if (!searchString) {
      return NextResponse.json({ error: "searchString parameter is required" }, { status: 400 })
    }

    let endpoint = `Search?searchString=${encodeURIComponent(searchString)}`
    if (locationID) {
      endpoint += `&locationID=${locationID}`
    }

    const searchResults = await qqcatalystRequest(endpoint, "GET")

    return NextResponse.json(searchResults)
  } catch (error) {
    console.error("Error performing search:", error)
    return NextResponse.json(
      { error: error.message || "Failed to perform search" },
      { status: error.response?.status || 500 },
    )
  }
}
