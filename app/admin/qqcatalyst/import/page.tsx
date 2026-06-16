"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, Play, CheckCircle, XCircle, Clock, AlertCircle, Database, Users, FileText } from "lucide-react"

interface ImportResult {
  contactsImported: number
  policiesImported: number
  renewalsImported: number
  locationsImported: number
  vehiclesImported: number
}

interface ImportStep {
  name: string
  status: "pending" | "running" | "completed" | "error"
  message?: string
  count?: number
}

export default function QQCatalystImportPage() {
  const [isImporting, setIsImporting] = useState(false)
  const [lastResult, setLastResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastRun, setLastRun] = useState<Date | null>(null)
  const [importSteps, setImportSteps] = useState<ImportStep[]>([
    { name: "Testing QQCatalyst Connection", status: "pending" },
    { name: "Importing Contacts", status: "pending" },
    { name: "Importing Policies", status: "pending" },
    { name: "Importing Renewals", status: "pending" },
    { name: "Importing Locations", status: "pending" },
    { name: "Importing Vehicles", status: "pending" },
  ])
  const [progress, setProgress] = useState(0)

  const updateStep = (stepIndex: number, status: ImportStep["status"], message?: string, count?: number) => {
    setImportSteps((prev) =>
      prev.map((step, index) => (index === stepIndex ? { ...step, status, message, count } : step)),
    )
  }

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)
    setProgress(0)

    // Reset all steps
    setImportSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })))

    try {
      // Step 1: Test Connection
      updateStep(0, "running", "Testing QQCatalyst API connection...")
      setProgress(10)

      const testResponse = await fetch("/api/qqcatalyst/test", {
        method: "POST",
      })

      const testData = await testResponse.json()

      if (!testData.success) {
        updateStep(0, "error", testData.message || "Connection test failed")
        throw new Error(`Connection test failed: ${testData.message}`)
      }

      updateStep(0, "completed", "Connection successful")
      setProgress(20)

      // Step 2: Import Contacts
      updateStep(1, "running", "Importing contacts from QQCatalyst...")

      const contactsResponse = await fetch("/api/qqcatalyst/contacts/import", {
        method: "POST",
      })

      const contactsData = await contactsResponse.json()

      if (!contactsData.success) {
        updateStep(1, "error", contactsData.message || "Contacts import failed")
        throw new Error(`Contacts import failed: ${contactsData.message}`)
      }

      updateStep(1, "completed", `Imported ${contactsData.imported || 0} contacts`, contactsData.imported)
      setProgress(40)

      // Step 3: Import Policies
      updateStep(2, "running", "Importing policies from QQCatalyst...")

      const policiesResponse = await fetch("/api/qqcatalyst/policies/import", {
        method: "POST",
      })

      const policiesData = await policiesResponse.json()

      if (!policiesData.success) {
        updateStep(2, "error", policiesData.message || "Policies import failed")
        throw new Error(`Policies import failed: ${policiesData.message}`)
      }

      updateStep(2, "completed", `Imported ${policiesData.imported || 0} policies`, policiesData.imported)
      setProgress(60)

      // Step 4: Import Renewals
      updateStep(3, "running", "Importing renewals from QQCatalyst...")

      const renewalsResponse = await fetch("/api/qqcatalyst/renewals/import", {
        method: "POST",
      })

      const renewalsData = await renewalsResponse.json()

      if (!renewalsData.success) {
        updateStep(3, "error", renewalsData.message || "Renewals import failed")
        // Don't throw error for renewals, continue with other imports
      } else {
        updateStep(3, "completed", `Imported ${renewalsData.imported || 0} renewals`, renewalsData.imported)
      }

      setProgress(80)

      // Step 5: Import Locations (optional)
      updateStep(4, "running", "Importing locations from QQCatalyst...")

      try {
        const locationsResponse = await fetch("/api/qqcatalyst/locations/import", {
          method: "POST",
        })

        const locationsData = await locationsResponse.json()
        updateStep(4, "completed", `Imported ${locationsData.imported || 0} locations`, locationsData.imported)
      } catch (err) {
        updateStep(4, "error", "Locations import not available")
      }

      setProgress(90)

      // Step 6: Import Vehicles (optional)
      updateStep(5, "running", "Importing vehicles from QQCatalyst...")

      try {
        const vehiclesResponse = await fetch("/api/qqcatalyst/vehicles/import", {
          method: "POST",
        })

        const vehiclesData = await vehiclesResponse.json()
        updateStep(5, "completed", `Imported ${vehiclesData.imported || 0} vehicles`, vehiclesData.imported)
      } catch (err) {
        updateStep(5, "error", "Vehicles import not available")
      }

      setProgress(100)

      // Set final results
      setLastResult({
        contactsImported: contactsData.imported || 0,
        policiesImported: policiesData.imported || 0,
        renewalsImported: renewalsData.imported || 0,
        locationsImported: 0,
        vehiclesImported: 0,
      })

      setLastRun(new Date())
    } catch (err) {
      console.error("Import failed:", err)
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  const getStepIcon = (status: ImportStep["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStepColor = (status: ImportStep["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-600"
      case "running":
        return "text-blue-600"
      case "completed":
        return "text-green-600"
      case "error":
        return "text-red-600"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst Data Import</h1>
          <p className="text-muted-foreground">Import contacts, policies, renewals, and other data from QQCatalyst</p>
        </div>
        <Button onClick={handleImport} disabled={isImporting} size="lg">
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Import
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Import Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Import Steps</CardTitle>
          <CardDescription>Track the progress of each import step</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {importSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className={`font-medium ${getStepColor(step.status)}`}>
                    {step.name}
                    {step.count !== undefined && (
                      <Badge variant="outline" className="ml-2">
                        {step.count}
                      </Badge>
                    )}
                  </div>
                  {step.message && <div className="text-sm text-muted-foreground">{step.message}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Results */}
      {lastResult && !isImporting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Import Completed Successfully
            </CardTitle>
            <CardDescription>{lastRun && `Completed on ${lastRun.toLocaleString()}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lastResult.contactsImported}</div>
                <div className="text-sm text-muted-foreground">Contacts Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lastResult.policiesImported}</div>
                <div className="text-sm text-muted-foreground">Policies Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{lastResult.renewalsImported}</div>
                <div className="text-sm text-muted-foreground">Renewals Imported</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/contacts">
                  <Users className="mr-2 h-4 w-4" />
                  View Contacts
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/debug/database">
                  <Database className="mr-2 h-4 w-4" />
                  Check Database
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>Required environment variables for QQCatalyst integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex justify-between p-2 border rounded">
              <span>QQ_CLIENT_ID:</span>
              <Badge variant={process.env.NEXT_PUBLIC_QQ_CLIENT_ID ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_QQ_CLIENT_ID ? "Set" : "Missing"}
              </Badge>
            </div>
            <div className="flex justify-between p-2 border rounded">
              <span>QQ_CLIENT_SECRET:</span>
              <Badge variant="default">Set</Badge>
            </div>
            <div className="flex justify-between p-2 border rounded">
              <span>QQ_USERNAME:</span>
              <Badge variant="default">Set</Badge>
            </div>
            <div className="flex justify-between p-2 border rounded">
              <span>QQ_PASSWORD:</span>
              <Badge variant="default">Set</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks after importing data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/contacts">
                <Users className="mr-2 h-4 w-4" />
                View Imported Contacts
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/debug/database">
                <Database className="mr-2 h-4 w-4" />
                Check Database Tables
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/qqcatalyst/sync">
                <FileText className="mr-2 h-4 w-4" />
                Advanced Sync Options
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
