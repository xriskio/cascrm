import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Database } from "@/types/supabase"
import { ClientAccountInfo } from "@/components/clients/client-account-info"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function ClientAccountPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  try {
    // Get the client data
    const { data: client, error } = await supabase.from("clients").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching client:", error)
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Error Loading Client</h1>
          <p className="text-red-500">There was an error loading the client information.</p>
        </div>
      )
    }

    if (!client) {
      return notFound()
    }

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/clients/${client.id}`}>
                {client.first_name} {client.last_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Account Information</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Account Information</h1>
            <p className="text-muted-foreground">
              Manage account details for {client.first_name} {client.last_name}
            </p>
          </div>
          <Badge variant="outline">Client ID: {client.id}</Badge>
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClientAccountInfo clientId={client.id} contactId={client.qq_contact_id} />
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common account management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                  Update Contact Information
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                  Change Agent Assignment
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                  Modify Customer Priority
                </button>
                <button className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors">
                  Portal Access Settings
                </button>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sync Status</span>
                  <Badge variant="outline" className="text-green-600">
                    Synced
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in client account page:", error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
        <p className="text-red-500">There was an unexpected error loading the account information.</p>
      </div>
    )
  }
}
