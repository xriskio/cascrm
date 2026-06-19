"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, Users, FileText, DollarSign } from "lucide-react"

const endpoints = [
  {
    category: "Customers",
    icon: Users,
    endpoints: [
      {
        method: "GET",
        path: "v1/Customers",
        description: "Get a list of customers",
        params: "$top, $skip, $orderby, $filter",
        example: "v1/Customers?$top=10&$orderby=CustomerSince desc",
      },
      {
        method: "GET",
        path: "v1/Customers/{customerID}",
        description: "Get a specific customer by ID",
        params: "customerID (required)",
        example: "v1/Customers/12345",
      },
      {
        method: "GET",
        path: "v1/Customers/{customerID}/CustomerDetailSummary",
        description: "Get detailed customer summary (recommended)",
        params: "customerID (required)",
        example: "v1/Customers/12345/CustomerDetailSummary",
      },
      {
        method: "GET",
        path: "v1/Customers/{customerID}/Policies",
        description: "Get policies for a specific customer",
        params: "customerID (required)",
        example: "v1/Customers/12345/Policies",
      },
    ],
  },
  {
    category: "Policies",
    icon: FileText,
    endpoints: [
      {
        method: "GET",
        path: "v1/Policies",
        description: "Get a list of policies",
        params: "$top, $skip, $orderby, $filter",
        example: "v1/Policies?$top=10&$filter=Status eq 'Active'",
      },
      {
        method: "GET",
        path: "v1/Policies/{policyID}",
        description: "Get a specific policy by ID",
        params: "policyID (required)",
        example: "v1/Policies/67890",
      },
    ],
  },
  {
    category: "Quotes",
    icon: DollarSign,
    endpoints: [
      {
        method: "GET",
        path: "v1/Quotes",
        description: "Get a list of quotes",
        params: "$top, $skip, $orderby, $filter",
        example: "v1/Quotes?$top=10&$orderby=CreatedDate desc",
      },
      {
        method: "GET",
        path: "v1/Quotes/{quoteID}",
        description: "Get a specific quote by ID",
        params: "quoteID (required)",
        example: "v1/Quotes/11111",
      },
    ],
  },
]

export default function QQCatalystEndpointsPage() {
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (endpoint: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/qqcatalyst/test?type=custom&endpoint=${encodeURIComponent(endpoint)}`)
      const result = await response.json()
      setTestResults((prev) => ({ ...prev, [endpoint]: result }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [endpoint]: { success: false, error: error instanceof Error ? error.message : String(error) } }))
    } finally {
      setLoading(false)
    }
  }

  const runEndpointDiscovery = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/qqcatalyst/test?type=endpoints-discovery")
      const result = await response.json()
      setTestResults((prev) => ({ ...prev, discovery: result }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, discovery: { success: false, error: error instanceof Error ? error.message : String(error) } }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst API Endpoints</h1>
          <p className="text-muted-foreground">Reference guide for available QQCatalyst API endpoints</p>
        </div>
        <Button onClick={runEndpointDiscovery} disabled={loading}>
          {loading ? "Testing..." : "Discover Available Endpoints"}
        </Button>
      </div>

      {testResults.discovery && (
        <Alert className="mb-6">
          <Database className="h-4 w-4" />
          <AlertTitle>Endpoint Discovery Results</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {testResults.discovery.data?.results?.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-mono text-sm">{result.endpoint}</span>
                  <Badge variant={result.status.includes("✅") ? "default" : "destructive"}>{result.status}</Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>

        {endpoints.map((category) => (
          <TabsContent key={category.category.toLowerCase()} value={category.category.toLowerCase()}>
            <div className="space-y-4">
              {category.endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5" />
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </CardTitle>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <strong>Parameters:</strong> {endpoint.params}
                      </div>
                      <div>
                        <strong>Example:</strong>
                        <code className="ml-2 bg-muted px-2 py-1 rounded text-sm">{endpoint.example}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testEndpoint(endpoint.example)}
                        disabled={loading}
                      >
                        Test This Endpoint
                      </Button>

                      {testResults[endpoint.example] && (
                        <Alert variant={testResults[endpoint.example].success ? "default" : "destructive"}>
                          {testResults[endpoint.example].success ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <AlertTitle>{testResults[endpoint.example].success ? "Success" : "Failed"}</AlertTitle>
                          <AlertDescription>
                            {testResults[endpoint.example].success
                              ? "Endpoint is working correctly"
                              : testResults[endpoint.example].error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
