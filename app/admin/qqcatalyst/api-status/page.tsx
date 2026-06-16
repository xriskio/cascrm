"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiStatus {
  success: boolean
  message: string
  endpoints?: {
    name: string
    status: "success" | "error"
    message?: string
  }[]
}

export default function QQCatalystApiStatusPage() {
  const [status, setStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [importLoading, setImportLoading] = useState(false)
  const { toast } = useToast()

  const checkApiStatus = async () => {
    setLoading(true)
    try {
      // Check auth status
      const authResponse = await fetch("/api/auth/qqcatalyst/status")
      const authData = await authResponse.json()

      // Check basic endpoints
      const endpoints = []

      try {
        const contactsResponse = await fetch("/api/qqcatalyst/test?endpoint=Contacts&limit=1")
        const contactsData = await contactsResponse.json()
        endpoints.push({
          name: "Contacts API",
          status: contactsData.success ? "success" : "error",
          message: contactsData.success ? `Found ${contactsData.count || 0} contacts` : contactsData.message,
        })
      } catch (error) {
        endpoints.push({
          name: "Contacts API",
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }

      try {
        const policiesResponse = await fetch("/api/qqcatalyst/test?endpoint=Policies&limit=1")
        const policiesData = await policiesResponse.json()
        endpoints.push({
          name: "Policies API",
          status: policiesData.success ? "success" : "error",
          message: policiesData.success ? `Found ${policiesData.count || 0} policies` : policiesData.message,
        })
      } catch (error) {
        endpoints.push({
          name: "Policies API",
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }

      setStatus({
        success: authData.success,
        message: authData.message || (authData.success ? "API connection successful" : "API connection failed"),
        endpoints,
      })
    } catch (error) {
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to check API status",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setImportLoading(true)
    try {
      const response = await fetch("/api/qq-import")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${data.data.contactsImported} contacts, ${data.data.policiesImported} policies, ${data.data.clientsImported} clients, and ${data.data.renewalsImported} renewals`,
        })
      } else {
        toast({
          title: "Import Failed",
          description: data.message || "Failed to import from QQCatalyst",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setImportLoading(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">QQCatalyst API Status</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Connection Status</CardTitle>
            <CardDescription>Check if the QQCatalyst API is properly connected</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3">Checking API status...</span>
              </div>
            ) : status ? (
              <div className="space-y-4">
                <Alert variant={status.success ? "default" : "destructive"}>
                  {status.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertTitle>{status.success ? "Connected" : "Connection Failed"}</AlertTitle>
                  <AlertDescription>{status.message}</AlertDescription>
                </Alert>

                {status.endpoints && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Endpoint Status</h3>
                    <div className="space-y-3">
                      {status.endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            {endpoint.status === "success" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span>{endpoint.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{endpoint.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to check API status</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={checkApiStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Checking..." : "Refresh Status"}
            </Button>

            <Button onClick={handleImport} disabled={importLoading || (status && !status.success)}>
              <Download className={`h-4 w-4 mr-2 ${importLoading ? "animate-spin" : ""}`} />
              {importLoading ? "Importing..." : "Import Data"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Current QQCatalyst API configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Environment Variables</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center justify-between">
                    <span>QQ_CLIENT_ID</span>
                    <span>{process.env.QQ_CLIENT_ID ? "✓ Set" : "✗ Not Set"}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>QQ_CLIENT_SECRET</span>
                    <span>{process.env.QQ_CLIENT_SECRET ? "✓ Set" : "✗ Not Set"}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>QQ_USERNAME</span>
                    <span>{process.env.QQ_USERNAME ? "✓ Set" : "✗ Not Set"}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>QQ_PASSWORD</span>
                    <span>{process.env.QQ_PASSWORD ? "✓ Set" : "✗ Not Set"}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">API Endpoints</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center justify-between">
                    <span>Authentication</span>
                    <span className="text-sm text-gray-500">https://login.qqcatalyst.com/oauth/token</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Base API</span>
                    <span className="text-sm text-gray-500">https://api.qqcatalyst.com/v1</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <a href="/admin/qqcatalyst/tokens">Manage API Tokens</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
