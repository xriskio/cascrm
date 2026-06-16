"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, TestTube, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { saveManualToken, testQQToken, getActiveToken, clearAllTokens } from "@/app/actions/manual-token-actions"

export default function TokenManagerPage() {
  const [token, setToken] = useState("")
  const [tokenName, setTokenName] = useState("Manual QQ Token")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeToken, setActiveToken] = useState<any>(null)

  const handleSaveToken = async () => {
    if (!token.trim()) {
      setResult({
        success: false,
        error: "Please enter a token",
      })
      return
    }

    setLoading(true)
    try {
      const result = await saveManualToken(token.trim(), tokenName)
      setResult(result)
      if (result.success) {
        setToken("")
        await loadActiveToken()
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestToken = async () => {
    if (!token.trim()) {
      setResult({
        success: false,
        error: "Please enter a token to test",
      })
      return
    }

    setLoading(true)
    try {
      const result = await testQQToken(token.trim())
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadActiveToken = async () => {
    try {
      const result = await getActiveToken()
      setActiveToken(result)
    } catch (error) {
      console.error("Error loading active token:", error)
    }
  }

  const handleClearTokens = async () => {
    if (confirm("Are you sure you want to clear all tokens?")) {
      setLoading(true)
      try {
        const result = await clearAllTokens()
        setResult(result)
        setActiveToken(null)
      } catch (error) {
        setResult({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  // Load active token on mount
  React.useEffect(() => {
    loadActiveToken()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">QQCatalyst Token Manager</h1>
          <p className="text-muted-foreground mt-2">Manually enter and test your QQCatalyst access token</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Current Active Token */}
        {activeToken && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Current Active Token
                {activeToken.success ? (
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    No Token
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeToken.success ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Name:</strong> {activeToken.tokenName}
                  </p>
                  <p className="text-sm">
                    <strong>Token:</strong>{" "}
                    <code className="text-xs bg-muted p-1 rounded">{activeToken.token.substring(0, 20)}...</code>
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No active token found. Please add one below.</p>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList>
            <TabsTrigger value="add">Add Token</TabsTrigger>
            <TabsTrigger value="test">Test Token</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Token</CardTitle>
                <CardDescription>Enter your QQCatalyst access token manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="My QQCatalyst Token"
                  />
                </div>

                <div>
                  <Label htmlFor="token">Access Token</Label>
                  <Textarea
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your QQCatalyst access token here..."
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This token will be tested before saving to ensure it works with QQCatalyst API
                  </p>
                </div>

                <Button onClick={handleSaveToken} disabled={loading} className="w-full">
                  {loading ? "Testing & Saving..." : "Save Token"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Token</CardTitle>
                <CardDescription>Test a token without saving it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testToken">Access Token</Label>
                  <Textarea
                    id="testToken"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste token to test..."
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <Button onClick={handleTestToken} disabled={loading} variant="outline" className="w-full">
                  <TestTube className="mr-2 h-4 w-4" />
                  {loading ? "Testing..." : "Test Token"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Tokens</CardTitle>
                <CardDescription>Clear all stored tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleClearTokens} disabled={loading} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Tokens
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : result.isHtml ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>
              {result.message || result.error}
              {result.testResult && (
                <div className="mt-2 text-xs">
                  <strong>Test Result:</strong> {JSON.stringify(result.testResult, null, 2)}
                </div>
              )}
              {result.isHtml && (
                <div className="mt-2 text-xs">
                  <strong>Note:</strong> The API returned HTML instead of JSON. This usually means the endpoint doesn't
                  exist or the token is invalid.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
