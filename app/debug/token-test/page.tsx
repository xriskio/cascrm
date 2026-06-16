"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TokenTestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/qq-token-test")
      const data = await response.json()
      setTestResult(data)
      console.log("🔍 Token test result:", data)
    } catch (error) {
      console.error("Test failed:", error)
      setTestResult({ success: false, error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">QQCatalyst Token Test</h1>
        <Button onClick={runTest} disabled={loading}>
          {loading ? "Testing..." : "Run Test"}
        </Button>
      </div>

      {testResult && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Working Token Found:</strong>{" "}
                  <span className={testResult.summary?.workingTokenFound ? "text-green-600" : "text-red-600"}>
                    {testResult.summary?.workingTokenFound ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div>
                  <strong>Working Method:</strong> {testResult.summary?.workingTokenMethod || "None"}
                </div>
                <div>
                  <strong>JSON Endpoints:</strong> {testResult.summary?.apiEndpointsReturningJson || 0}
                </div>
                <div>
                  <strong>HTML Endpoints:</strong> {testResult.summary?.apiEndpointsReturningHtml || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResult.environment || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-mono">{key}:</span>
                    <span className={String(value).includes("❌") ? "text-red-600" : "text-green-600"}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Token Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Token Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResult.tokenTests?.map((test: any, index: number) => (
                  <div key={index} className="border p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{test.method}</span>
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "✅ Success" : "❌ Failed"} ({test.status})
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">URL: {test.url}</div>
                    {test.tokenData && (
                      <div className="text-sm">
                        <strong>Token Type:</strong> {test.tokenData.token_type} <br />
                        <strong>Expires In:</strong> {test.tokenData.expires_in}s <br />
                        <strong>Access Token:</strong> {test.tokenData.access_token?.substring(0, 20)}...
                      </div>
                    )}
                    {test.response && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600">View Response</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">{test.response}</pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Tests */}
          {testResult.apiTests && testResult.apiTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>API Endpoint Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResult.apiTests.map((test: any, index: number) => (
                    <div key={index} className="border p-4 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-sm">{test.endpoint}</span>
                        <span className={test.success ? "text-green-600" : "text-red-600"}>
                          {test.success ? "✅" : "❌"} {test.status}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>Content-Type: {test.contentType}</div>
                        <div>Is JSON: {test.isJson ? "✅" : "❌"}</div>
                        <div>Is HTML: {test.isHtml ? "⚠️ Yes" : "✅ No"}</div>
                      </div>
                      {test.response && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600">View Response</summary>
                          <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">{test.response}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
