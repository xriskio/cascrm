export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { searchPoliciesWithDates } from "@/lib/qqcatalyst/api-enhanced"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      policyNumber: searchParams.get("policyNumber") || undefined,
      lobFilterID: searchParams.get("lobFilterID") ? Number.parseInt(searchParams.get("lobFilterID")!) : undefined,
      locationFilterID: searchParams.get("locationFilterID")
        ? Number.parseInt(searchParams.get("locationFilterID")!)
        : undefined,
      effectiveFromDateTime: searchParams.get("effectiveFromDateTime") || undefined,
      effectiveToDateTime: searchParams.get("effectiveToDateTime") || undefined,
      expiredFromDateTime: searchParams.get("expiredFromDateTime") || undefined,
      expiredToDateTime: searchParams.get("expiredToDateTime") || undefined,
      pageNumber: searchParams.get("pageNumber") ? Number.parseInt(searchParams.get("pageNumber")!) : 1,
      pageSize: searchParams.get("pageSize") ? Number.parseInt(searchParams.get("pageSize")!) : 50,
    }

    const result = await searchPoliciesWithDates(params)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Policy search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during policy search",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await searchPoliciesWithDates(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Policy search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during policy search",
      },
      { status: 500 },
    )
  }
}
