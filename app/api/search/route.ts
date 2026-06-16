import { NextRequest, NextResponse } from "next/server"
import { globalSearch } from "@/app/actions/global-search-actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      )
    }

    const results = await globalSearch(query.trim())
    
    return NextResponse.json(results)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    )
  }
}
