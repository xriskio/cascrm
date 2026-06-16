"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, ExternalLink, Play, PlayCircle } from "lucide-react"
import {
  testClientNavigation,
  testAllClients,
  getAllClientsForTesting,
  type ClientNavigationTestResult,
} from "./test-client-navigation"
import Link from "next/link"

export default function ClientNavigationTestPage() {
  const [testResults, setTestResults] = useState<ClientNavigationTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([])

  const loadAvailableClients = async () => {
    try {
      const clients = await getAllClientsForTesting()
      setAvailableClients(clients)
    } catch (error) {
      console.error("Error loading clients:", error)
    }
  }

  const runSingleTest = async (clientId: string) => {
    setIsRunning(true)
    try {
      const result = await testClientNavigation(clientId)
      setTestResults((prev) => {
        const filtered = prev.filter((r) => r.clientId !== clientId)
        return [...filtered, result]
      })
    } catch (error) {
      console.error("Error running test:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    try {
      const results = await testAllClients()
      setTestResults(results)
    } catch (error) {
      console.error("Error running all tests:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return <Badge variant={success ? "default" : "destructive"}>{success ? "PASS" : "FAIL"}</Badge>
  }

  const successRate =
    testResults.length > 0
      ? Math.round((testResults.filter((r) => r.overallSuccess).length / testResults.length) * 100)
      : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Navigation Test Suite</h1>
          <p className="text-muted-foreground">
            Test client detail page navigation and authentication after deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAvailableClients} variant="outline">
            Load Clients
          </Button>
          <Button onClick={runAllTests} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? <Clock className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Test Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{testResults.length}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter((r) => r.overallSuccess).length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter((r) => !r.overallSuccess).length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Clients */}
      {availableClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Clients</CardTitle>
            <CardDescription>Click to test individual client navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableClients.map((client) => (
                <Button
                  key={client.id}
                  variant="outline"
                  onClick={() => runSingleTest(client.id)}
                  disabled={isRunning}
                  className="justify-start"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {client.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result) => (
          <Card key={result.clientId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(result.overallSuccess)}
                  Client {result.clientId}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.overallSuccess)}
                  <Badge variant="outline">{result.executionTime}ms</Badge>
                  <Link href={`/clients/${result.clientId}`} target="_blank">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit Page
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.results.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getStatusIcon(step.success)}
                    <div className="flex-1">
                      <div className="font-medium">{step.step}</div>
                      {step.error && <div className="text-sm text-red-600 mt-1">{step.error}</div>}
                      {step.data && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <pre className="text-xs">{JSON.stringify(step.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && !isRunning && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              No tests run yet. Click "Load Clients" to see available clients, then run individual tests or "Run All
              Tests" to begin.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
