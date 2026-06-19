import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Database } from "@/types/supabase"
import { ClientFilesPanel } from "@/components/clients/client-files-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder } from "lucide-react"

export default async function ClientDocumentsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  try {
    const { data: client, error } = await supabase.from("clients").select("*").eq("id", params.id).single()

    if (error || !client) {
      return notFound()
    }

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Folder className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Documents & Files</h1>
            <p className="text-muted-foreground">
              {client.first_name} {client.last_name} - {client.company_name}
            </p>
          </div>
        </div>

        <ClientFilesPanel clientId={client.id} contactId={client.qqcatalyst_contact_id || client.id} />
      </div>
    )
  } catch (error) {
    console.error("Error loading client documents:", error)
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load client documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">There was an error loading the client documents. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
