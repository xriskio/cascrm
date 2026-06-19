"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, Database } from "lucide-react"

export default function DataDebugPage() {
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchTableData = async (tableName: string) => {
    try {
      const { data: tableData, error, count } = await (supabase as any).from(tableName).select("*", { count: "exact" }).limit(5)

      if (error) throw error

      return { data: tableData, count, error: null }
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error)
      return { data: [], count: 0, error: (error as any).message }
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const tables = ["contacts", "policies", "clients", "qqcatalyst_contact_accounts", "customer_details"]
      const results: Record<string, any> = {}

      for (const table of tables) {
        results[table] = await fetchTableData(table)
      }

      setData(results)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Debug</h1>
          <p className="text-muted-foreground">Check what data is actually in your database</p>
        </div>
        <Button onClick={fetchAllData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts ({data.contacts?.count || 0})</TabsTrigger>
          <TabsTrigger value="policies">Policies ({data.policies?.count || 0})</TabsTrigger>
          <TabsTrigger value="clients">Clients ({data.clients?.count || 0})</TabsTrigger>
          <TabsTrigger value="accounts">Accounts ({data.qqcatalyst_contact_accounts?.count || 0})</TabsTrigger>
          <TabsTrigger value="details">Details ({data.customer_details?.count || 0})</TabsTrigger>
        </TabsList>

        {Object.entries(data).map(([tableName, tableInfo]) => (
          <TabsContent key={tableName} value={tableName}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {tableName} Table
                </CardTitle>
                <CardDescription>
                  {tableInfo?.error ? (
                    <span className="text-red-500">Error: {tableInfo.error}</span>
                  ) : (
                    `${tableInfo?.count || 0} total records (showing first 5)`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tableInfo?.error ? (
                  <div className="text-red-500 p-4 bg-red-500/10 rounded">
                    Error loading {tableName}: {tableInfo.error}
                  </div>
                ) : tableInfo?.data?.length === 0 ? (
                  <div className="text-muted-foreground p-4 bg-muted rounded">No data found in {tableName} table</div>
                ) : (
                  <div className="space-y-4">
                    {tableInfo?.data?.map((record: any, index: number) => (
                      <div key={index} className="p-4 bg-muted rounded">
                        <pre className="text-xs overflow-auto">{JSON.stringify(record, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
