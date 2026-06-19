import { type NextRequest, NextResponse } from "next/server"
import { importPoliciesFromQQCatalyst } from "@/app/actions/qqcatalyst-import-actions"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting policies import from QQCatalyst...")

    const result = await importPoliciesFromQQCatalyst()

    if (result.success) {
      console.log(`Successfully imported ${(result as any).imported} policies`)
      return NextResponse.json({
        success: true,
        imported: (result as any).imported,
        total: (result as any).total,
        message: result.message,
      })
    } else {
      console.error("Policies import failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import policies",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in policies import API:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
