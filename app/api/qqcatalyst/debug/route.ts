import { createClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { qqClient } from "@/lib/qqcatalyst/client"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const diagnostics = {
      timestamp: new Date().toISOString(),
      database: {} as Record<string, any>,
      qqcatalyst: {} as Record<string, any>,
      environment: {
        QQ_API_BASE: process.env.QQ_API_BASE || "Not set",
        QQ_CLIENT_ID: process.env.QQ_CLIENT_ID ? "Set" : "Not set",
        QQ_CLIENT_SECRET: process.env.QQ_CLIENT_SECRET ? "Set" : "Not set",
        SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
      },
    }

    // Check database tables
    const tables = ["clients", "policies", "contact_accounts", "customer_details", "policy_info"]

    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        diagnostics.database[table] = {
          exists: !error,
          count: count || 0,
          error: error ? error.message : null,
        }
      } catch (err) {
        diagnostics.database[table] = {
          exists: false,
          count: 0,
          error: (err as any).message,
        }
      }
    }

    // Check QQCatalyst connection
    try {
      // Try to get a token
      const token = await qqClient.getToken()
      diagnostics.qqcatalyst.token = {
        success: !!token,
        length: token ? token.length : 0,
      }

      // Try to get customers
      try {
        const customers = await qqClient.request("Customers?$top=1")
        diagnostics.qqcatalyst.customers = {
          success: true,
          sample: customers,
        }
      } catch (err) {
        diagnostics.qqcatalyst.customers = {
          success: false,
          error: (err as any).message,
        }
      }

      // Try to get policies (using POST)
      try {
        const policies = await qqClient.request("Policies?$top=1")
        diagnostics.qqcatalyst.policies = {
          success: true,
          sample: policies,
        }
      } catch (err) {
        diagnostics.qqcatalyst.policies = {
          success: false,
          error: (err as any).message,
        }
      }
    } catch (err) {
      diagnostics.qqcatalyst.connection = {
        success: false,
        error: (err as any).message,
      }
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: (error as any).message }, { status: 500 })
  }
}
