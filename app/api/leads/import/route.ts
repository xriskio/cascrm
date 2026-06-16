import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = request.headers.get("content-type")

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData()
      const files = formData.getAll("files") as File[]

      if (files.length === 0) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 })
      }

      let totalImported = 0
      const errors: string[] = []

      for (const file of files) {
        try {
          const text = await file.text()
          const leads = parseCSV(text)

          for (const lead of leads) {
            // Generate proper lead number
            const leadNumber = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
            
            const { error } = await supabase.from("leads").insert({
              ...lead,
              lead_id: leadNumber,
              name: lead.contact_name || lead.company_name || lead.name || "Unknown",
              created_by: user.id,
              date_entered: new Date().toISOString(),
              status: lead.status || "new",
              priority: lead.priority || "medium",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (error) {
              errors.push(`Error importing lead ${lead.contact_name}: ${error.message}`)
            } else {
              totalImported++
            }
          }
        } catch (error) {
          errors.push(`Error processing file ${file.name}: ${(error as Error).message}`)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Import completed`,
        imported: totalImported,
        errors,
      })
    } else {
      // Handle JSON data (paste import)
      const { data } = await request.json()

      if (!Array.isArray(data)) {
        return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
      }

      let imported = 0
      const errors: string[] = []

      for (const lead of data) {
        try {
          // Generate proper lead number
          const leadNumber = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
          
          const { error } = await supabase.from("leads").insert({
            ...lead,
            lead_id: leadNumber,
            name: lead.contact_name || lead.company_name || lead.name || "Unknown",
            created_by: user.id,
            date_entered: new Date().toISOString(),
            status: lead.status || "new",
            priority: lead.priority || "medium",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (error) {
            errors.push(`Error importing lead: ${error.message}`)
          } else {
            imported++
          }
        } catch (error) {
          errors.push(`Error processing lead: ${(error as Error).message}`)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${imported} leads`,
        imported,
        errors,
      })
    }
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function parseCSV(text: string) {
  const lines = text.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const leads = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
    const lead: any = {}

    headers.forEach((header, index) => {
      lead[header.toLowerCase().replace(/\s+/g, "_")] = values[index] || ""
    })

    // Don't generate lead_id here - it will be generated in the insert loop
    leads.push(lead)
  }

  return leads
}
