export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { qqcatalystRequest } from "@/lib/qqcatalyst/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")
    const policyId = searchParams.get("policyId")
    const dlFileType = searchParams.get("dlFileType") || "All"
    const pageNumber = searchParams.get("pageNumber") || "1"
    const pageSize = searchParams.get("pageSize") || "20"

    if (!contactId) {
      return NextResponse.json({ error: "contactId parameter is required" }, { status: 400 })
    }

    let endpoint = `Files/FilesByContact?contactid=${contactId}&dlFileType=${dlFileType}&pageNumber=${pageNumber}&pageSize=${pageSize}`

    if (policyId) {
      endpoint = `Files/FilesByPolicy?contactid=${contactId}&policyid=${policyId}&dlFileType=${dlFileType}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    }

    const files = await qqcatalystRequest(endpoint, "GET")

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: (error as any).message || "Failed to fetch files" },
      { status: (error as any).response?.status || 500 },
    )
  }
}
