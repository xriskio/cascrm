"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle, Loader2, User, Key, Info } from "lucide-react"

interface TestResult {
  success: boolean
  error?: string
  data?: any
}

export default function QQCatalystTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ [key: string]: TestResult }>({})
  const [customerId, setCustomerId] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [accessToken, setAccessToken] = useState("")
  const [savedToken, setSavedToken] = useState("")
  const [requestLogs, setRequestLogs] = useState<string[]>([])

  // Default token from previous conversation
  const defaultToken =
    "AAEAAJYiBxLVWK_c_bNoAz9KwVEQFUXotwGlCZ_Xv4CnhRbwn53a5GivU7uf9vTvjVcGQvQDGLFDQGsAcBBLVYe5-A-KeM-x2EpNi6WABjkSicyJJv8ZVUswioUEo74KWZOjlQFnwR8EZL5JyrcNjsCfbAvRN-86IFxDD-VssFmj1dhSzlyEChroLWFbdS_0orx96VkcAXhpMGcRd5atX7d1S0B9KTndqAbWNz4rd4XEJoJVR5M9Yk0oe1gofuSZxVQ4UCmDbD4i8CXAWOBXfGTTqu104qvaYafmCHhhB3WcpdKt5bkZjsBofKGjvcJWBRcQKUXma64aliZ-R5UME0NPBFDUAwAAAAEAABAkEEPZOWe-t2kU8iws8tfDpO7NUvIhpla4NAX_phn6518KoLwKQl0rqVwF1zG-2-VF8XBMvb_Y9sTpHuynZlj36C6xEvEcda75NQAcGIkqtfYQ9LH3krJQTIzI5ulP-Qq9Cu-JC3jbXoYLu37RFKIgWyBD3XZFN5RjDJ5epBMupPHFQ2xRzjF1yOM6e5Xjr6EOFg1xkxUOF3uIKdLjlXv6tVlbE8P-AnCR7j9yrcC6wW1UXzwgl40D-81Oye7LPPSgt7Znc28FAZWxa_T2npc1OhHSg8Sr_4lfWLE1hP57ba6LjmfVRUGQ2rvPV9goTElEWXjxrfD_3x4mCfJYxSzY5T3ap2zVJ5lRNyKmKMzPn1bFYCktNO4biynE8sMN5ieZaqO4H0eRKlGlapsYnTYBWwKw9viEZiXRnlmYAZ0xESFzEYSXRIokghrGGgmlC5uxu4HVsoIA7bxfrlLs7S25QSk_nWgekAk0VdAjR8i94HdSr_ozsFqyjM1BkFwUC0fWNQOf62eaw3RmoKqMX7smAmwxj1dxID3H4CC6HLcedG1TRxCI2HozTn4zxyjhmtvhHwHQpTQOpYojmk9-GPyPygszzK58Q8ihCTIsiUOgZb/HcTaQpn7NlkHCplyXSuSEQAzJasoox6jXMVTvrVM73kYMocOXo9EELl43T4ulKjfNnZvHcxHOmxDsBSAazmJZj2OEHIDEzpSWJADp3ccdWqspH1Sism8tOTJzKjI16RGACOko0DFSz0wkWcVGesssKWXvyEVH3nF-ST79NWQwEMu_vHFnb-bqAkuEA-lZoSf4SHRtiuzGmpu2fYmUtgQIFdTFy5KAgkxO8Q0GBGBXEBCkO9vjAVfbfyb9S9MrDDLMpay8M8fAG3GPizAfxGbl4kB9pPa29LvJKh2DV-tMazyo9azbkoG8i4TK1dU3ybUr3X_QTxZpNQKlEAfJ-MoJFjzczI-cEnqQuEo0xwZ9oD5HSgATuvkn4f0NuUj4JzKAbgUufG9EYBwL5_9wUxyBrhtbKduPcI7z4rwdvlZPtMPWnxvaHOWxECqpYssPYrG2Zc-DtZiAwDEGt2cbFmeHBSNjUfkLKj18dbVUKBebcAFDTmf41IFc3G43gfK0Ta4yiqxl9Bf8DDyRZdCVAQaMw7UF5YPZWnjufm9cDe_umJFDilPwMdTElIN9QWcbbU4abP09Ube5hom-j_MpFY8y4PguCGgeAjcOegtVyLrg5Pfzn5npvtnEOGEVvI_3cr_qJL5YfnQqj4GyoqionznXQQvbomeu5dXbFG0X7MA"

  useEffect(() => {
    // Try to load token from localStorage
    const storedToken = localStorage.getItem("qqc_access_token")
    if (storedToken) {
      setSavedToken(storedToken)
      setAccessToken(storedToken)
    } else if (defaultToken) {
      setAccessToken(defaultToken)
    }
  }, [])

  const saveToken = () => {
    if (accessToken) {
      localStorage.setItem("qqc_access_token", accessToken)
      localStorage.setItem("qqc_token_saved_at", new Date().toISOString())
      setSavedToken(accessToken)
      // Also set as a cookie for API routes
      document.cookie = `qqc_access_token=${accessToken}; path=/; max-age=604800; SameSite=Lax`
      alert("Access token saved successfully!")
    }
  }

  const runTest = async (testType: string, params?: Record<string, string>) => {
    if (!accessToken) {
      alert("Please enter an access token first")
      return
    }

    setLoading(true)
    addLog(`Starting test: ${testType}`)

    try {
      const queryParams = new URLSearchParams({ type: testType, ...params })
      const response = await fetch(`/api/qqcatalyst/test?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const result = await response.json()

      setResults((prev) => ({
        ...prev,
        [testType]: result,
      }))

      addLog(`Test ${testType} completed: ${result.success ? "Success" : "Failed"}`)

      // If we're testing customers and get results, set the first customer for detail testing
      if (testType === "customers" && result.success && result.data?.customers?.length > 0) {
        setSelectedCustomer(result.data.customers[0])
        setCustomerId(result.data.customers[0].CustomerID || result.data.customers[0].ID || "")
        addLog(
          `Selected customer: ${result.data.customers[0].CustomerName || result.data.customers[0].Name || "Unknown"}`,
        )
      }
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testType]: { success: false, error: error instanceof Error ? error.message : String(error) },
      }))
      addLog(`Error in test ${testType}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    addLog("Starting all tests")
    await runTest("connection")
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second between tests
    await runTest("customers")
    addLog("All tests completed")
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    setRequestLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)])
  }

  const TestCard = ({
    title,
    description,
    testKey,
    onTest,
    icon: Icon,
  }: {
    title: string
    description: string
    testKey: string
    onTest: () => void
    icon: any
  }) => {
    const result = results[testKey]

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
            {result && (
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Success" : "Failed"}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTest} disabled={loading} className="mb-4">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              `Test ${title}`
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Test Passed" : "Test Failed"}</AlertTitle>
              <AlertDescription>
                {result.success ? (
                  <div className="mt-2">
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  result.error
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QQCatalyst API Tests</h1>
        <Button onClick={runAllTests} disabled={loading || !accessToken}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run All Tests"
          )}
        </Button>
      </div>

      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>API Method Information</AlertTitle>
        <AlertDescription>
          Some QQCatalyst endpoints (like Policies) require POST instead of GET. The client has been updated to handle
          this automatically.
        </AlertDescription>
      </Alert>

      {/* Token Management Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Access Token
          </CardTitle>
          <CardDescription>Enter your QQCatalyst access token to run tests</CardDescription>
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
            <div className="flex gap-2">
              <Button onClick={saveToken} variant="secondary">
                Save Token
              </Button>
              {savedToken && (
                <Button variant="outline" onClick={() => setAccessToken(savedToken)}>
                  Restore Saved Token
                </Button>
              )}
            </div>
            {savedToken && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Token Saved</AlertTitle>
                <AlertDescription>You have a saved token that will be used for API requests.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Tests</TabsTrigger>
          <TabsTrigger value="customers">Customer Tests</TabsTrigger>
          <TabsTrigger value="policies">Policy Tests</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <TestCard
            title="Connection Test"
            description="Test basic API connectivity and authentication"
            testKey="connection"
            onTest={() => runTest("connection")}
            icon={CheckCircle}
          />

          <TestCard
            title="Fetch Customers"
            description="Retrieve a list of customers from QQCatalyst"
            testKey="customers"
            onTest={() => runTest("customers")}
            icon={User}
          />
          <TestCard
            title="Discover Endpoints"
            description="Test multiple endpoints to discover what's available in the QQCatalyst API"
            testKey="endpoints-discovery"
            onTest={() => runTest("endpoints-discovery")}
            icon={CheckCircle}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Detail Test</CardTitle>
              <CardDescription>Test fetching detailed information for a specific customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter Customer ID"
                />
                {selectedCustomer && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedCustomer.CustomerName || selectedCustomer.Name || "Unknown"}
                  </div>
                )}
              </div>
              <Button
                onClick={() => runTest("customer-detail", { customerId })}
                disabled={loading || !customerId || !accessToken}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Customer Detail"
                )}
              </Button>

              {results["customer-detail"] && (
                <Alert variant={results["customer-detail"].success ? "default" : "destructive"}>
                  {results["customer-detail"].success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{results["customer-detail"].success ? "Test Passed" : "Test Failed"}</AlertTitle>
                  <AlertDescription>
                    {results["customer-detail"].success ? (
                      <div className="mt-2">
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(results["customer-detail"].data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      results["customer-detail"].error
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Policies Test</CardTitle>
              <CardDescription>Test fetching policies for a specific customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerIdPolicies">Customer ID</Label>
                <Input
                  id="customerIdPolicies"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter Customer ID"
                />
              </div>
              <Button
                onClick={() => runTest("customer-policies", { customerId })}
                disabled={loading || !customerId || !accessToken}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Customer Policies"
                )}
              </Button>

              {results["customer-policies"] && (
                <Alert variant={results["customer-policies"].success ? "default" : "destructive"}>
                  {results["customer-policies"].success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{results["customer-policies"].success ? "Test Passed" : "Test Failed"}</AlertTitle>
                  <AlertDescription>
                    {results["customer-policies"].success ? (
                      <div className="mt-2">
                        <div className="mb-2">
                          Found {results["customer-policies"].data?.count || 0} policies for this customer
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(results["customer-policies"].data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      results["customer-policies"].error
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Request Logs</CardTitle>
              <CardDescription>Log of API requests and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md h-[400px] overflow-y-auto font-mono text-xs">
                {requestLogs.length === 0 ? (
                  <div className="text-muted-foreground">No logs yet. Run some tests to see logs here.</div>
                ) : (
                  requestLogs.map((log, i) => (
                    <div key={i} className="py-1 border-b border-border last:border-0">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Section */}
      {Object.keys(results).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
            <CardDescription>Overview of all test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(results).map(([testKey, result]) => (
                <div key={testKey} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">{testKey.replace("-", " ").toUpperCase()}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "✓ Pass" : "✗ Fail"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
