import type { Metadata } from "next"
import LeadForm from "../lead-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Create New Lead | InsureTrac",
  description: "Create a new sales lead in the system",
}

export default function NewLeadPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/leads">
              <Users className="h-4 w-4 mr-2" />
              Leads
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Create New Lead</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create a New Lead</h1>
          <p className="text-muted-foreground">Enter the details to create a new sales lead</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>Fill out the form below with the lead's contact information and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  )
}
