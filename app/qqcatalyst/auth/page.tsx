"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, Key, Lock } from "lucide-react"

export default function QQCatalystAuthPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [credentials, setCredentials] = useState({
    username: "wael@casurance.com",
    password: "Think0202!!!",
    clientId: "44c42186-c1b7-49ae-afd4-73d77527acc1",
    clientSecret: "f3f28807-ed94-409c-9e99-6e69cbec5e3e",
    tokenUrl: "https://login.qqcatalyst.com/oauth/token",
  })

  const authenticate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/auth/qqcatalyst/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Store token info in localStorage for the test page
        localStorage.setItem("qqc_authenticated", "true")
        localStorage.setItem("qqc_auth_time", new Date().toISOString())
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const testServerAuth = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/auth/qqcatalyst/token", {
        method: "GET",
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Generate Access Token</h1>
          <p className="text-muted-foreground mt-2">
            Create your QQCatalyst API access token to enable data synchronization
          </p>
        </div>
      </div>

      {/* Getting Started Alert */}
      <Alert className="mb-6">
        <Key className="h-4 w-4" />
        <AlertTitle>First Time Setup</AlertTitle>
        <AlertDescription>
          This is where you generate your QQCatalyst access token. You'll need your QQCatalyst login credentials to
          proceed. Once generated, this token will allow InsureTrack to sync data with your QQCatalyst system.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 max-w-2xl">
        {/* Manual Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Manual Authentication
            </CardTitle>
            <CardDescription>
              Enter your QQCatalyst credentials to get an access token using OAuth password flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="email"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={credentials.clientSecret}
                    onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tokenUrl">Token URL</Label>
                <Input
                  id="tokenUrl"
                  value={credentials.tokenUrl}
                  onChange={(e) => setCredentials({ ...credentials, tokenUrl: e.target.value })}
                />
              </div>

              <Button onClick={authenticate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Get Access Token"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Server-side Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Server Authentication
            </CardTitle>
            <CardDescription>
              Use server-side environment variables to authenticate (recommended for production)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testServerAuth} disabled={loading} className="w-full" variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Test Server Authentication"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Authentication Result
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Successful</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{result.message}</p>
                      {result.tokenPreview && (
                        <p>
                          <strong>Token Preview:</strong> <code className="text-xs">{result.tokenPreview}</code>
                        </p>
                      )}
                      <div className="mt-4">
                        <Button asChild size="sm">
                          <a href="/admin/qqcatalyst/test">Test API Connection</a>
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Failed</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{result.error}</p>
                      {result.details && <p className="text-sm">{result.details}</p>}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>OAuth Flow Details</CardTitle>
            <CardDescription>How the authentication works</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">1. Token Request</h4>
                <p className="text-muted-foreground">
                  POST to <code>https://login.qqcatalyst.com/oauth/token</code> with form-urlencoded data
                </p>
              </div>
              <div>
                <h4 className="font-medium">2. Required Parameters</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>grant_type: password</li>
                  <li>client_id: Your QQCatalyst client ID</li>
                  <li>client_secret: Your QQCatalyst client secret</li>
                  <li>username: Your QQCatalyst username</li>
                  <li>password: Your QQCatalyst password</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">3. API Usage</h4>
                <p className="text-muted-foreground">
                  Use the access_token with <code>Authorization: Bearer &lt;token&gt;</code> header for all API calls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
