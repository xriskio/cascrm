import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const supabase = await createClient()

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json(clients)
  } catch (error: any) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Handle single client creation
    if (!Array.isArray(body)) {
      // Generate client number
      const { data: clientNumber, error: rpcError } = await supabase.rpc("generate_client_number")

      if (rpcError) {
        console.error("RPC error:", rpcError)
        throw new Error(`Failed to generate client number: ${rpcError.message}`)
      }

      const clientData = {
        ...body,
        client_number: clientNumber,
      }

      const { data: client, error } = await supabase.from("clients").insert([clientData]).select().single()

      if (error) {
        console.error("Insert error:", error)
        throw new Error(`Failed to create client: ${error.message}`)
      }

      return NextResponse.json(client)
    }

    // Handle batch client creation (for imports)
    const clients = body
    const results = {
      success: 0,
      errors: 0,
      total: clients.length,
      errorDetails: [] as string[],
    }

    // Process in smaller chunks to avoid overwhelming Supabase
    const chunkSize = 100
    for (let i = 0; i < clients.length; i += chunkSize) {
      const chunk = clients.slice(i, i + chunkSize)

      try {
        // Generate client numbers for the chunk
        const clientsWithNumbers = await Promise.all(
          chunk.map(async (client: any) => {
            try {
              const { data: clientNumber } = await supabase.rpc("generate_client_number")
              return {
                ...client,
                client_number: clientNumber,
                name: client.account_name || client.name, // Ensure name field is set
                current_status: client.current_status || "active",
              }
            } catch (error: any) {
              console.error("Error generating client number:", error)
              return {
                ...client,
                client_number: `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: client.account_name || client.name,
                current_status: client.current_status || "active",
              }
            }
          }),
        )

        const { data, error } = await supabase.from("clients").insert(clientsWithNumbers).select()

        if (error) {
          console.error("Batch insert error:", error)
          results.errors += chunk.length
          results.errorDetails.push(`Chunk ${Math.floor(i / chunkSize) + 1}: ${error.message}`)
        } else {
          results.success += data?.length || 0
        }
      } catch (chunkError: any) {
        console.error("Chunk processing error:", chunkError)
        results.errors += chunk.length
        results.errorDetails.push(`Chunk ${Math.floor(i / chunkSize) + 1}: ${chunkError.message}`)
      }

      // Small delay between chunks
      if (i + chunkSize < clients.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error in POST /api/clients:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
