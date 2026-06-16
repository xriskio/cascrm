"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, Key, ExternalLink, Database } from "lucide-react"

export default function QQCatalystOAuthPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [redirectUri, setRedirectUri] = useState("")

  // OAuth configuration matching the React app
  const oauthConfig = {
    authUrl: "https://login.qqcatalyst.com/oauth/authorize",
    clientId: "fdc3c5d6-4bd4-40c0-b681-d2ad2f5db414",
    redirectUri: redirectUri,
    responseType: "code",
    scope: "read write",
  }

  useEffect(() => {
    // Set redirect URI from window (only runs on client)
    setRedirectUri(`${window.location.origin}/api/auth/qqcatalyst/callback`)
    
    // Check for access token in URL params (similar to React app)
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get("access_token")

    if (accessToken && accessToken.length > 0) {
      setToken(accessToken)
      setLoggedIn(true)
      fetchApiData(accessToken)
    }
  }, [])

  const fetchApiData = async (accessToken: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/qqcatalyst/test?access_token=${accessToken}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching API data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = () => {
    const authUrl = `${oauthConfig.authUrl}?client_id=${oauthConfig.clientId}&redirect_uri=${encodeURIComponent(oauthConfig.redirectUri)}&response_type=${oauthConfig.responseType}&scope=${encodeURIComponent(oauthConfig.scope)}`
    window.location.href = authUrl
  }

  const handleDirectAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/qqcatalyst/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const result = await response.json()

      if (result.success && result.access_token) {
        setToken(result.access_token)
        setLoggedIn(true)
        fetchApiData(result.access_token)
      }
    } catch (error) {
      console.error("Direct auth error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst OAuth Integration</h1>
          <p className="text-muted-foreground mt-2">Connect with QQCatalyst using OAuth2 authentication</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {!loggedIn ? (
          <div className="text-center space-y-6">
            {/* QQ Logo placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Database className="h-16 w-16 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold">Sign in with QQ OAuth2</h2>

            <div className="grid gap-4 max-w-md mx-auto">
              <Button size="lg" onClick={handleOAuthLogin} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Sign in with OAuth
                  </>
                )}
              </Button>

              <Button variant="outline" size="lg" onClick={handleDirectAuth} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Direct Authentication
                  </>
                )}
              </Button>
            </div>

            {/* OAuth Configuration Info */}
            <Card className="max-w-2xl mx-auto mt-8">
              <CardHeader>
                <CardTitle>OAuth Configuration</CardTitle>
                <CardDescription>Current OAuth settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Client ID:</span>
                    <code className="text-xs">{oauthConfig.clientId}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Auth URL:</span>
                    <code className="text-xs">{oauthConfig.authUrl}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Redirect URI:</span>
                    <code className="text-xs">{oauthConfig.redirectUri}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Scope:</span>
                    <code className="text-xs">{oauthConfig.scope}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Welcome!</AlertTitle>
              <AlertDescription>
                Successfully authenticated with QQCatalyst. You can now access the API.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              {/* Token Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Access Token
                    <Badge variant="default">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs bg-muted p-2 rounded block break-all">{token}</code>
                </CardContent>
              </Card>

              {/* API Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Sample API Call Data
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data ? (
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">Loading API data...</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button asChild>
                  <a href="/admin/qqcatalyst/import">Import Data</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/admin/qqcatalyst/dashboard">View Dashboard</a>
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
