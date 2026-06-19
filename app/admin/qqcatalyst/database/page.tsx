"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Database, CheckCircle, AlertCircle, Calendar, RefreshCw } from "lucide-react"
import {
  initializeQQCatalystSchemaAction,
  testDatabaseConnectionAction,
  getPolicySyncStatsAction,
  getExpiringPoliciesAction,
} from "@/app/actions/database-setup-actions"

export default function QQCatalystDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [initResult, setInitResult] = useState<any>(null)
  const [syncStats, setSyncStats] = useState<any>(null)
  const [expiringPolicies, setExpiringPolicies] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    try {
      const result = await testDatabaseConnectionAction()
      setTestResult(result)

      if (result.success) {
        // If connection is successful, fetch stats
        fetchSyncStats()
      }
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const initializeSchema = async () => {
    setLoading(true)
    setInitResult(null)
    try {
      const result = await initializeQQCatalystSchemaAction()
      setInitResult(result)

      if (result.success) {
        // Re-test connection after initialization
        await testConnection()
      }
    } catch (error) {
      setInitResult({ success: false, error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const fetchSyncStats = async () => {
    try {
      const result = await getPolicySyncStatsAction()
      setSyncStats(result)
    } catch (error) {
      console.error("Error fetching sync stats:", error)
    }
  }

  const fetchExpiringPolicies = async () => {
    try {
      const result = await getExpiringPoliciesAction(90) // 90 days
      setExpiringPolicies(result)
    } catch (error) {
      console.error("Error fetching expiring policies:", error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (value === "expiring" && !expiringPolicies) {
      fetchExpiringPolicies()
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QQCatalyst Database Management</h1>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </>
          )}
        </Button>
      </div>

      {/* Connection Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Status
          </CardTitle>
          <CardDescription>Check the connection to your Supabase database and QQCatalyst schema</CardDescription>
        </CardHeader>
        <CardContent>
          {testResult ? (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{testResult.success ? "Connection Successful" : "Connection Failed"}</AlertTitle>
              <AlertDescription>
                {testResult.success
                  ? "Successfully connected to the database and verified QQCatalyst schema."
                  : testResult.error}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {testResult && !testResult.success && testResult.needsInitialization && (
            <div className="mt-4">
              <Button onClick={initializeSchema} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize QQCatalyst Schema"
                )}
              </Button>

              {initResult && (
                <Alert variant={initResult.success ? "default" : "destructive"} className="mt-4">
                  {initResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{initResult.success ? "Initialization Successful" : "Initialization Failed"}</AlertTitle>
                  <AlertDescription>
                    {initResult.success
                      ? "Successfully initialized the QQCatalyst schema in your database."
                      : initResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {testResult && testResult.success && (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sync">Sync Statistics</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>QQCatalyst Integration Overview</CardTitle>
                <CardDescription>Summary of your QQCatalyst data integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Total Policies</div>
                    <div className="text-3xl font-bold">
                      {syncStats?.success ? syncStats.policyCount.toLocaleString() : "-"}
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Sync Operations</div>
                    <div className="text-3xl font-bold">
                      {syncStats?.success && syncStats.stats
                        ? syncStats.stats.reduce((acc: number, curr: any) => acc + curr.total_syncs, 0)
                        : "-"}
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Last Sync</div>
                    <div className="text-lg font-medium">
                      {syncStats?.success && syncStats.stats && syncStats.stats.length > 0
                        ? new Date(syncStats.stats[0].last_sync_at).toLocaleString()
                        : "No syncs yet"}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Available Tables</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>qqcatalyst_policies</span>
                    </div>
                    <div className="flex items-center p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>qqcatalyst_policy_details</span>
                    </div>
                    <div className="flex items-center p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>qqcatalyst_policy_agency_fees</span>
                    </div>
                    <div className="flex items-center p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>qqcatalyst_policy_producers</span>
                    </div>
                    <div className="flex items-center p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>qqcatalyst_policy_drivers</span>
                    </div>
                    <div className="flex items-center p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>qqcatalyst_sync_logs</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Statistics</CardTitle>
                <CardDescription>Details of QQCatalyst data synchronization operations</CardDescription>
              </CardHeader>
              <CardContent>
                {syncStats?.success ? (
                  syncStats.stats && syncStats.stats.length > 0 ? (
                    <div className="space-y-6">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4">Sync Type</th>
                              <th className="text-left py-2 px-4">Total Syncs</th>
                              <th className="text-left py-2 px-4">Success</th>
                              <th className="text-left py-2 px-4">Failed</th>
                              <th className="text-left py-2 px-4">Items Processed</th>
                              <th className="text-left py-2 px-4">Last Sync</th>
                              <th className="text-left py-2 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {syncStats.stats.map((stat: any, index: number) => (
                              <tr key={index} className="border-b">
                                <td className="py-2 px-4 font-medium">{stat.sync_type}</td>
                                <td className="py-2 px-4">{stat.total_syncs}</td>
                                <td className="py-2 px-4">{stat.successful_syncs}</td>
                                <td className="py-2 px-4">{stat.failed_syncs}</td>
                                <td className="py-2 px-4">{stat.items_processed}</td>
                                <td className="py-2 px-4">
                                  {stat.last_sync_at ? new Date(stat.last_sync_at).toLocaleString() : "Never"}
                                </td>
                                <td className="py-2 px-4">
                                  <Badge variant={stat.last_sync_status === "completed" ? "default" : "destructive"}>
                                    {stat.last_sync_status || "unknown"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Total Items Processed</div>
                          <div className="text-3xl font-bold">
                            {syncStats.stats
                              .reduce((acc: number, curr: any) => acc + Number(curr.items_processed || 0), 0)
                              .toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Items Created</div>
                          <div className="text-3xl font-bold">
                            {syncStats.stats
                              .reduce((acc: number, curr: any) => acc + Number(curr.items_created || 0), 0)
                              .toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Items Updated</div>
                          <div className="text-3xl font-bold">
                            {syncStats.stats
                              .reduce((acc: number, curr: any) => acc + Number(curr.items_updated || 0), 0)
                              .toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Items Failed</div>
                          <div className="text-3xl font-bold">
                            {syncStats.stats
                              .reduce((acc: number, curr: any) => acc + Number(curr.items_failed || 0), 0)
                              .toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No Sync Data</AlertTitle>
                      <AlertDescription>
                        No synchronization operations have been performed yet. Start syncing data from QQCatalyst to see
                        statistics.
                      </AlertDescription>
                    </Alert>
                  )
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Expiring Policies
                </CardTitle>
                <CardDescription>Policies expiring in the next 90 days</CardDescription>
              </CardHeader>
              <CardContent>
                {!expiringPolicies ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : expiringPolicies.success ? (
                  expiringPolicies.policies && expiringPolicies.policies.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Policy #</th>
                            <th className="text-left py-2 px-4">Customer</th>
                            <th className="text-left py-2 px-4">Carrier</th>
                            <th className="text-left py-2 px-4">Agent</th>
                            <th className="text-left py-2 px-4">Expiration</th>
                            <th className="text-left py-2 px-4">Days Left</th>
                            <th className="text-right py-2 px-4">Premium</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiringPolicies.policies.map((policy: any) => (
                            <tr key={policy.id} className="border-b">
                              <td className="py-2 px-4 font-medium">{policy.policy_number}</td>
                              <td className="py-2 px-4">{policy.customer_name}</td>
                              <td className="py-2 px-4">{policy.carrier_name}</td>
                              <td className="py-2 px-4">{policy.agent_name}</td>
                              <td className="py-2 px-4">{new Date(policy.expiration_date).toLocaleDateString()}</td>
                              <td className="py-2 px-4">
                                <Badge
                                  variant={
                                    (policy.days_until_expiration <= 30
                                      ? "destructive"
                                      : policy.days_until_expiration <= 60
                                        ? "warning"
                                        : "default") as any
                                  }
                                >
                                  {policy.days_until_expiration}
                                </Badge>
                              </td>
                              <td className="py-2 px-4 text-right">
                                $
                                {policy.total_premium?.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No Expiring Policies</AlertTitle>
                      <AlertDescription>
                        No policies are expiring in the next 90 days, or no policy data has been synced yet.
                      </AlertDescription>
                    </Alert>
                  )
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{expiringPolicies.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
