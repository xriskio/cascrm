"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Key, RefreshCw } from "lucide-react"

export default function TokenStatusPage() {
  const [tokenStatus, setTokenStatus] = useState<{
    hasToken: boolean
    tokenPreview: string
    lastSaved: string | null
    isValid: boolean | null
  }>({
    hasToken: false,
    tokenPreview: "",
    lastSaved: null,
    isValid: null,
  })

  const [testing, setTesting] = useState(false)

  const checkTokenStatus = () => {
    const storedToken = localStorage.getItem("qqc_access_token")
    const lastSaved = localStorage.getItem("qqc_token_saved_at")

    if (storedToken) {
      setTokenStatus({
        hasToken: true,
        tokenPreview: `${storedToken.substring(0, 20)}...${storedToken.substring(storedToken.length - 10)}`,
        lastSaved: lastSaved ? new Date(lastSaved).toLocaleString() : "Unknown",
        isValid: null,
      })
    } else {
      setTokenStatus({
        hasToken: false,
        tokenPreview: "",
        lastSaved: null,
        isValid: null,
      })
    }
  }

  const testToken = async () => {
    const storedToken = localStorage.getItem("qqc_access_token")
    if (!storedToken) return

    setTesting(true)
    try {
      const response = await fetch("/api/qqcatalyst/test?type=connection", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
      const result = await response.json()

      setTokenStatus((prev) => ({
        ...prev,
        isValid: result.success,
      }))
    } catch (error) {
      setTokenStatus((prev) => ({
        ...prev,
        isValid: false,
      }))
    } finally {
      setTesting(false)
    }
  }

  const clearToken = () => {
    localStorage.removeItem("qqc_access_token")
    localStorage.removeItem("qqc_token_saved_at")
    document.cookie = "qqc_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    checkTokenStatus()
  }

  useEffect(() => {
    checkTokenStatus()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Token Status</h1>
        <Button onClick={checkTokenStatus} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Token Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Access Token Status
              {tokenStatus.hasToken && (
                <Badge variant={tokenStatus.isValid === true ? "default" : "secondary"}>
                  {tokenStatus.isValid === true ? "Valid" : tokenStatus.isValid === false ? "Invalid" : "Unknown"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Current status of your QQCatalyst access token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenStatus.hasToken ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Token Found</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>Token Preview:</strong> <code className="text-xs">{tokenStatus.tokenPreview}</code>
                      </p>
                      {tokenStatus.lastSaved && (
                        <p>
                          <strong>Last Saved:</strong> {tokenStatus.lastSaved}
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Token Found</AlertTitle>
                  <AlertDescription>
                    No access token is currently saved. Please go to the test page to save your token.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {tokenStatus.hasToken && (
                  <>
                    <Button onClick={testToken} disabled={testing}>
                      {testing ? "Testing..." : "Test Token"}
                    </Button>
                    <Button onClick={clearToken} variant="destructive">
                      Clear Token
                    </Button>
                  </>
                )}
                <Button asChild variant="outline">
                  <a href="/admin/qqcatalyst/test">Go to Test Page</a>
                </Button>
              </div>

              {tokenStatus.isValid === true && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Token is Valid</AlertTitle>
                  <AlertDescription>Your token successfully connected to the QQCatalyst API.</AlertDescription>
                </Alert>
              )}

              {tokenStatus.isValid === false && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Token is Invalid</AlertTitle>
                  <AlertDescription>
                    Your token failed to connect to the QQCatalyst API. Please check your token and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>What you can do now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Test API Connection</h4>
                  <p className="text-sm text-muted-foreground">Verify your token works with the QQCatalyst API</p>
                </div>
                <Button asChild size="sm">
                  <a href="/admin/qqcatalyst/test">Test Now</a>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Run Data Sync</h4>
                  <p className="text-sm text-muted-foreground">Import contacts and policies from QQCatalyst</p>
                </div>
                <Button asChild size="sm" disabled={!tokenStatus.hasToken}>
                  <a href="/admin/qqcatalyst/sync">Sync Data</a>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">View Imported Data</h4>
                  <p className="text-sm text-muted-foreground">Browse contacts and policies in your database</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href="/admin/qqcatalyst/data-viewer">View Data</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
