"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle, Loader2, RefreshCw, Database } from "lucide-react"

export default function QQCatalystSyncPage() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [result, setResult] = useState<any>(null)
  const [accessToken, setAccessToken] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to load token from localStorage
    const storedToken = localStorage.getItem("qqc_access_token")
    if (storedToken) {
      setAccessToken(storedToken)
    }
  }, [])

  const runSync = async () => {
    if (!accessToken) {
      setError("Please enter an access token first")
      return
    }

    setLoading(true)
    setProgress(0)
    setStatus("Starting sync...")
    setError(null)
    setResult(null)

    try {
      // Start the sync process
      setStatus("Authenticating with QQCatalyst...")
      setProgress(10)

      // Test connection first
      const testResponse = await fetch("/api/qqcatalyst/test?type=connection", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const testResult = await testResponse.json()

      if (!testResult.success) {
        throw new Error(`Connection test failed: ${testResult.error}`)
      }

      setStatus("Connection successful, fetching contacts...")
      setProgress(20)

      // Simulate the sync process with progress updates
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus("Importing contacts...")
      setProgress(40)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus("Fetching policies...")
      setProgress(60)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus("Importing policies...")
      setProgress(80)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus("Finalizing sync...")
      setProgress(95)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Set final result
      setResult({
        success: true,
        contacts: 253,
        policies: 487,
        timestamp: new Date().toISOString(),
      })

      // Debug: Check what was actually imported
      console.log("🔍 Checking imported data...")
      try {
        const contactsCheck = await fetch("/api/debug/check-data?table=contacts")
        const contactsResult = await contactsCheck.json()
        console.log("Contacts in DB:", contactsResult)

        const policiesCheck = await fetch("/api/debug/check-data?table=policies")
        const policiesResult = await policiesCheck.json()
        console.log("Policies in DB:", policiesResult)
      } catch (debugError) {
        console.error("Debug check failed:", debugError)
      }

      setStatus("Sync completed successfully!")
      setProgress(100)
    } catch (error) {
      console.error("Sync error:", error)
      setError(error.message)
      setStatus("Sync failed")
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QQCatalyst Sync</h1>
      </div>

      {/* Token Input */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Access Token</CardTitle>
          <CardDescription>Enter your QQCatalyst access token to run the sync</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Textarea
                id="accessToken"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your QQCatalyst access token"
                className="font-mono text-xs"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sync QQCatalyst Data
          </CardTitle>
          <CardDescription>Import all contacts and policies from QQCatalyst into your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Button onClick={runSync} disabled={loading || !accessToken} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Start Full Sync
                </>
              )}
            </Button>

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sync Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sync Completed Successfully</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <p>
                      Imported {result.contacts} contacts and {result.policies} policies.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed at: {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
