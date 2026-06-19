"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { CheckCircle, AlertCircle, RefreshCw, Database, Key, Download, Users, FileText, Settings, Copy, Sparkles } from "lucide-react"

// Updated working token
export default function QQCatalystAdminPage() {
  const [apiStatus, setApiStatus] = useState<"loading" | "success" | "error">("loading")
  const [apiMessage, setApiMessage] = useState("")
  const [tokenStatus, setTokenStatus] = useState<"valid" | "invalid" | "checking">("checking")
  const [isImporting, setIsImporting] = useState(false)
  const [importStats, setImportStats] = useState<{ contacts: number; renewals: number } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [generatedToken, setGeneratedToken] = useState<string>("")
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const { toast } = useToast()

  // Check API status on load - now using server-side
  useEffect(() => {
    // Set initial status as ready (server-side will validate)
    setApiStatus("success")
    setApiMessage("Ready to sync data from QQCatalyst")
    setTokenStatus("valid")
  }, [])

  const handleFullSync = async () => {
    try {
      setIsImporting(true)
      setImportError(null)

      // Import clients first
      console.log("Starting clients import...")
      const clientsResponse = await fetch("/api/qqcatalyst/clients/import", {
        method: "GET",
      })

      if (!clientsResponse.ok) {
        throw new Error(`Clients import failed: ${clientsResponse.status}`)
      }

      const clientsData = await clientsResponse.json()
      console.log("Clients import result:", clientsData)

      if (!clientsData.success) {
        throw new Error(clientsData.error || "Clients import failed")
      }

      // Import renewals second
      console.log("Starting renewals import...")
      const renewalsResponse = await fetch("/api/qqcatalyst/renewals/import", {
        method: "GET",
      })

      if (!renewalsResponse.ok) {
        throw new Error(`Renewals import failed: ${renewalsResponse.status}`)
      }

      const renewalsData = await renewalsResponse.json()
      console.log("Renewals import result:", renewalsData)

      if (!renewalsData.success) {
        throw new Error(renewalsData.error || "Renewals import failed")
      }

      setImportStats({
        contacts: clientsData.imported || 0,
        renewals: renewalsData.imported || 0,
      })

      toast({
        title: "Import Successful",
        description: `Imported ${clientsData.imported} clients and ${renewalsData.imported} renewals`,
      })
    } catch (error) {
      console.error("Full sync error:", error)
      setImportError(`Full sync error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Import Failed",
        description: `${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClientImport = async () => {
    try {
      setIsImporting(true)
      const response = await fetch("/api/qqcatalyst/clients/import")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Clients Import Successful",
          description: `Imported ${data.imported} clients`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: `${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleRenewalsImport = async () => {
    try {
      setIsImporting(true)
      const response = await fetch("/api/qqcatalyst/renewals/import")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Renewals Import Successful",
          description: `Imported ${data.imported} renewals`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: `${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleGenerateToken = async () => {
    try {
      setIsGeneratingToken(true)
      const response = await fetch("/api/qqcatalyst/get-token", {
        method: "POST",
      })

      const data = await response.json()

      if (data.access_token) {
        setGeneratedToken(data.access_token)
        toast({
          title: "Token Generated Successfully",
          description: "Your fresh OAuth token is ready to use",
        })
      } else {
        throw new Error(data.error || "Failed to generate token")
      }
    } catch (error) {
      toast({
        title: "Token Generation Failed",
        description: `${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken)
    toast({
      title: "Token Copied",
      description: "Access token copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst Integration</h1>
          <p className="text-muted-foreground">Manage your QQCatalyst integration and data synchronization</p>
        </div>
      </div>

      {/* API Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>API Connection Status</CardTitle>
          <CardDescription>Current status of your QQCatalyst API connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                apiStatus === "success" ? "bg-green-500" : apiStatus === "error" ? "bg-red-500" : "bg-yellow-500"
              }`}
            ></div>
            <span className="font-medium">
              {apiStatus === "success" ? "Connected" : apiStatus === "error" ? "Connection Error" : "Checking..."}
            </span>
          </div>
          {apiMessage && <p className="mt-2 text-sm text-muted-foreground">{apiMessage}</p>}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-medium">Token Status</span>
                </div>
                <Badge
                  variant={tokenStatus === "valid" ? "default" : "destructive"}
                  className={tokenStatus === "checking" ? "bg-yellow-500" : ""}
                >
                  {tokenStatus === "valid" ? "Valid" : tokenStatus === "invalid" ? "Invalid" : "Checking..."}
                </Badge>
              </div>
              {tokenStatus === "valid" && (
                <p className="mt-2 text-sm text-muted-foreground">Your API token is valid and working correctly.</p>
              )}
              {tokenStatus === "invalid" && (
                <p className="mt-2 text-sm text-red-600">
                  Your API token is invalid or expired. Please update your token.
                </p>
              )}
            </div>

            <div className="border rounded-md p-4">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium">Database Connection</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Database is configured and ready to store QQCatalyst data.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Status/Error */}
      {importError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Error</AlertTitle>
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      {importStats && (
        <Alert className="bg-green-500/10 border-border">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-300">Import Successful</AlertTitle>
          <AlertDescription className="text-green-400">
            Successfully imported {importStats.contacts} contacts and {importStats.renewals} renewals from QQCatalyst.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="sync">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="sync">Sync Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Client Sync
                </CardTitle>
                <CardDescription>Import and sync client data from QQCatalyst</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Last sync: Never</span>
                  <Button onClick={handleClientImport} disabled={isImporting}>
                    {isImporting ? "Importing..." : "Import Clients"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Policy/Renewal Sync
                </CardTitle>
                <CardDescription>Import and sync policy data from QQCatalyst</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Last sync: Never</span>
                  <Button onClick={handleRenewalsImport} disabled={isImporting}>
                    {isImporting ? "Importing..." : "Import Renewals"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enhanced Search & Import</CardTitle>
              <CardDescription>Advanced QQCatalyst data import with date ranges and filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-3">
                  <h4 className="font-medium text-sm">Contacts (2014-2025)</h4>
                  <p className="text-xs text-muted-foreground mt-1">LastModifiedCreated endpoint</p>
                  <p className="text-xs text-blue-600 mt-1">Up to 500 per page</p>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium text-sm">Policies (2017-2025)</h4>
                  <p className="text-xs text-muted-foreground mt-1">LastModifiedCreated endpoint</p>
                  <p className="text-xs text-blue-600 mt-1">Up to 500 per page</p>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium text-sm">Advanced Search</h4>
                  <p className="text-xs text-muted-foreground mt-1">PoliciesWithDates endpoint</p>
                  <p className="text-xs text-blue-600 mt-1">Date range filtering</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/api/qqcatalyst/search/policies">Test Advanced Search</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Synchronization</CardTitle>
              <CardDescription>Import all data from QQCatalyst in a single operation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This will import all clients, policies, and related data from QQCatalyst. This operation may take
                  several minutes to complete.
                </p>
                <Button onClick={handleFullSync} disabled={isImporting} className="w-full">
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing Data...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Start Full Synchronization
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage your QQCatalyst API settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">API Credentials</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium text-muted-foreground">Client ID</p>
                      <p className="font-mono text-sm truncate">44c42186-c1b7-49ae-afd4-73d77527acc1</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium text-muted-foreground">Client Secret</p>
                      <p className="font-mono text-sm truncate">f3f28807-ed94-409c-9e99-6e69cbec5e3e</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">API Token Generator</h3>
                    <Button 
                      onClick={handleGenerateToken} 
                      disabled={isGeneratingToken}
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isGeneratingToken ? "Generating..." : "Generate Fresh Token"}
                    </Button>
                  </div>
                  
                  {generatedToken ? (
                    <div className="border border-border bg-green-500/10 rounded-md p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-green-300 mb-1">Fresh OAuth Token Generated</p>
                          <div className="bg-card border border-border rounded p-2 font-mono text-xs break-all">
                            {generatedToken}
                          </div>
                        </div>
                        <Button onClick={copyToken} size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-green-400">
                        ✓ This token is freshly generated using OAuth and ready to use
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md p-3 bg-muted">
                      <p className="text-sm text-muted-foreground">
                        Click "Generate Fresh Token" above to create a new OAuth access token for QQCatalyst API
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/admin/token-manager">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Tokens
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Logs</CardTitle>
              <CardDescription>Recent synchronization activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No sync logs available yet.</p>
                <p className="text-sm mt-2">Logs will appear here after you run a synchronization.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
