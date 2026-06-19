import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { PolicyFilesPanel } from "@/components/policies/policy-files-panel"

interface PolicyDetailPageProps {
  params: {
    id: string
    policyId: string
  }
}

// Mock policy data - replace with actual data fetching
async function getPolicyDetails(policyId: string) {
  // This would fetch from your database or QQCatalyst API
  return {
    id: policyId,
    policyNumber: "POL-2024-001234",
    type: "Commercial Auto",
    status: "Active",
    effectiveDate: "2024-01-01",
    expirationDate: "2025-01-01",
    premium: 2500.0,
    carrier: "ABC Insurance",
    contactId: "12345", // This would come from the policy data
  }
}

export default async function PolicyDetailPage({ params }: PolicyDetailPageProps) {
  const policy = await getPolicyDetails(params.policyId)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/clients/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Client
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Policy Details</h1>
            <p className="text-muted-foreground">{policy.policyNumber}</p>
          </div>
        </div>
        <Badge variant={policy.status === "Active" ? "default" : "secondary"}>{policy.status}</Badge>
      </div>

      {/* Policy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Type</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policy.type}</div>
            <p className="text-xs text-muted-foreground">{policy.carrier}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(policy.effectiveDate).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground">
              Expires: {new Date(policy.expirationDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${policy.premium.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per year</p>
          </CardContent>
        </Card>
      </div>

      {/* Policy Documents */}
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Loading policy documents...</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <PolicyFilesPanel contactId={policy.contactId} policyId={policy.id} policyNumber={policy.policyNumber} />
      </Suspense>
    </div>
  )
}
