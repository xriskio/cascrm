import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Database } from "@/types/supabase"
import { ClientTopNav } from "../client-top-nav"
import { AcordForms } from "./acord-forms"

export default async function ClientAcordPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  try {
    // Get the client data
    const { data: client, error } = await supabase.from("clients").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching client:", error)
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Error Loading Client</h1>
          <p className="text-red-500">There was an error loading the client information. Please try again later.</p>
          <p className="text-muted-foreground mt-2">Error details (for development): {error.message}</p>
        </div>
      )
    }

    if (!client) {
      return notFound()
    }

    return (
      <div className="h-full flex flex-col">
        {/* Top Navigation */}
        <ClientTopNav client={client} />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">ACORD Forms</h1>
          <AcordForms client={client} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in client ACORD page:", error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
        <p className="text-red-500">
          There was an unexpected error loading the client information. Please try again later.
        </p>
        <p className="text-muted-foreground mt-2">
          Error details (for development): {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    )
  }
}
