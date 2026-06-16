import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function QQContactsPage() {
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50)

  const { data: policies, error: policiesError } = await supabase
    .from("policies")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50)

  if (error || policiesError) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">QQCatalyst Data</h1>
        <div className="text-red-600">Error loading data: {error?.message || policiesError?.message}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">QQCatalyst Data</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contacts ({contacts?.length || 0})</CardTitle>
            <CardDescription>Recently imported contacts from QQCatalyst</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {contacts?.map((contact) => (
                <div key={contact.id} className="border rounded p-3">
                  <div className="font-medium">
                    {contact.first_name} {contact.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {contact.id}</div>
                  {contact.email && <div className="text-sm text-muted-foreground">Email: {contact.email}</div>}
                  {contact.phone && <div className="text-sm text-muted-foreground">Phone: {contact.phone}</div>}
                  <div className="text-xs text-muted-foreground mt-2">
                    Updated: {new Date(contact.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policies ({policies?.length || 0})</CardTitle>
            <CardDescription>Recently imported policies from QQCatalyst</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {policies?.map((policy) => (
                <div key={policy.id} className="border rounded p-3">
                  <div className="font-medium">{policy.policy_number}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {policy.id} | Contact: {policy.contact_id}
                  </div>
                  {policy.line_of_business && (
                    <Badge variant="secondary" className="mt-1">
                      {policy.line_of_business}
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    Updated: {new Date(policy.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
