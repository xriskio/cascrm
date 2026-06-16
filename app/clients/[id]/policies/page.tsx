import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Database } from "@/types/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  DollarSign,
  FileText,
  Plus,
  Eye,
  Edit,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface Policy {
  id: string
  policy_number: string
  policy_type: string
  carrier: string
  status: string
  premium: number
  effective_date: string
  expiration_date: string
  deductible: number
  created_at: string
}

export default async function ClientPoliciesPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  try {
    // Get the client data - try contacts table first
    let client = null
    const { data: contact } = await supabase.from("contacts").select("*").eq("id", params.id).single()

    if (contact) {
      client = {
        id: contact.id,
        name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown",
        first_name: contact.first_name,
        last_name: contact.last_name,
        business_name: contact.business_name,
        email: contact.email,
        phone: contact.phone,
        qq_contact_id: contact.id,
        source: "qqcatalyst",
      }
    } else {
      // Try clients table
      const { data: manualClient, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", params.id)
        .single()

      if (clientError) {
        console.error("Error fetching client:", clientError)
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Error Loading Client</h1>
            <p className="text-red-500">There was an error loading the client information.</p>
          </div>
        )
      }

      if (manualClient) {
        client = {
          ...manualClient,
          name:
            `${manualClient.first_name || ""} ${manualClient.last_name || ""}`.trim() || manualClient.name || "Unknown",
          source: "manual",
        }
      }
    }

    if (!client) {
      return notFound()
    }

    // Get policies for this client - check both contact_id and client_id
    const { data: policies, error: policiesError } = await supabase
      .from("policies")
      .select("*")
      .or(`contact_id.eq.${params.id},client_id.eq.${params.id}`)
      .order("updated_at", { ascending: false })

    if (policiesError) {
      console.error("Error fetching policies:", policiesError)
    }

    const clientPolicies = policies || []
    console.log(`Found ${clientPolicies.length} policies for client ${client.name}`)

    // Calculate policy metrics
    const activePolicies = clientPolicies.filter((p) => p.status === "active").length
    const totalPremium = clientPolicies.reduce((sum, p) => sum + (p.premium || 0), 0)
    const expiringPolicies = clientPolicies.filter((p) => {
      if (!p.expiration_date) return false
      const expirationDate = new Date(p.expiration_date)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return expirationDate <= thirtyDaysFromNow
    }).length

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString()
    }

    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case "active":
        case "bound":
          return "bg-green-100 text-green-800"
        case "pending":
          return "bg-yellow-100 text-yellow-800"
        case "expired":
        case "cancelled":
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status?.toLowerCase()) {
        case "active":
        case "bound":
          return <CheckCircle className="h-4 w-4" />
        case "pending":
          return <Clock className="h-4 w-4" />
        case "expired":
        case "cancelled":
          return <AlertTriangle className="h-4 w-4" />
        default:
          return <FileText className="h-4 w-4" />
      }
    }

    return (
      <div className="space-y-6">
        {/* Client Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-gray-600">
              {client.business_name && `${client.business_name} • `}
              {client.email} • {client.phone}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href={`/clients/${params.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Client
              </Link>
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </div>

        {/* Policy Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Policies</p>
                  <p className="text-2xl font-bold">{clientPolicies.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Policies</p>
                  <p className="text-2xl font-bold text-green-600">{activePolicies}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Premium</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPremium)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{expiringPolicies}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Client Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientPolicies.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Found</h3>
                <p className="text-gray-600 mb-4">
                  This client doesn't have any policies yet. Add a policy to get started.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Policy
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All Policies ({clientPolicies.length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({activePolicies})</TabsTrigger>
                  <TabsTrigger value="expiring">Expiring ({expiringPolicies})</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Expiration Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPolicies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium">{policy.policy_number || "N/A"}</TableCell>
                          <TableCell>{policy.policy_type || "N/A"}</TableCell>
                          <TableCell>{policy.carrier || "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(policy.status || "unknown")}>
                              {getStatusIcon(policy.status || "unknown")}
                              <span className="ml-1">{policy.status || "Unknown"}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(policy.premium || 0)}</TableCell>
                          <TableCell>{policy.effective_date ? formatDate(policy.effective_date) : "N/A"}</TableCell>
                          <TableCell>{policy.expiration_date ? formatDate(policy.expiration_date) : "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="active">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Expiration Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPolicies
                        .filter((p) => p.status === "active")
                        .map((policy) => (
                          <TableRow key={policy.id}>
                            <TableCell className="font-medium">{policy.policy_number || "N/A"}</TableCell>
                            <TableCell>{policy.policy_type || "N/A"}</TableCell>
                            <TableCell>{policy.carrier || "N/A"}</TableCell>
                            <TableCell>{formatCurrency(policy.premium || 0)}</TableCell>
                            <TableCell>{policy.expiration_date ? formatDate(policy.expiration_date) : "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="expiring">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Policy Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Expiration Date</TableHead>
                        <TableHead>Days Until Expiry</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPolicies
                        .filter((p) => {
                          if (!p.expiration_date) return false
                          const expirationDate = new Date(p.expiration_date)
                          const thirtyDaysFromNow = new Date()
                          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
                          return expirationDate <= thirtyDaysFromNow
                        })
                        .map((policy) => {
                          const daysUntilExpiry = policy.expiration_date
                            ? Math.ceil(
                                (new Date(policy.expiration_date).getTime() - new Date().getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )
                            : 0

                          return (
                            <TableRow key={policy.id}>
                              <TableCell className="font-medium">{policy.policy_number || "N/A"}</TableCell>
                              <TableCell>{policy.policy_type || "N/A"}</TableCell>
                              <TableCell>{policy.carrier || "N/A"}</TableCell>
                              <TableCell>{formatCurrency(policy.premium || 0)}</TableCell>
                              <TableCell>
                                {policy.expiration_date ? formatDate(policy.expiration_date) : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={daysUntilExpiry <= 7 ? "destructive" : "secondary"}>
                                  {daysUntilExpiry} days
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Renew
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in client policies page:", error)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
        <p className="text-red-500">
          There was an unexpected error loading the client policies. Please try again later.
        </p>
      </div>
    )
  }
}
