"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Database, Users, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function DataVerificationPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const tables = [
    { name: "clients", label: "Clients", icon: Users },
    { name: "policies", label: "Policies", icon: FileText },
    { name: "contact_accounts", label: "Contact Accounts", icon: Users },
    { name: "customer_details", label: "Customer Details", icon: Users },
    { name: "policy_info", label: "Policy Info", icon: FileText },
  ]

  const fetchTableData = async (tableName: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from(tableName).select("*").limit(10)

      if (error) throw error

      // Get count
      const { count, error: countError } = await supabase.from(tableName).select("*", { count: "exact", head: true })

      if (countError) throw countError

      setTableData((prev) => ({
        ...prev,
        [tableName]: {
          data,
          count,
        },
      }))
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err)
      setError(`Failed to fetch ${tableName}: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTables = async () => {
    setLoading(true)
    setError(null)

    try {
      for (const table of tables) {
        await fetchTableData(table.name)
      }
    } catch (err) {
      setError(`Failed to fetch all tables: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const TableCard = ({ table }) => {
    const tableInfo = tableData[table.name]
    const Icon = table.icon

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {table.label}
            {tableInfo && (
              <span className="text-sm font-normal text-muted-foreground">({tableInfo.count} records)</span>
            )}
          </CardTitle>
          <CardDescription>
            {tableInfo
              ? `Showing ${Math.min(tableInfo.data.length, 10)} of ${tableInfo.count} records`
              : "No data fetched yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!tableInfo ? (
            <Button onClick={() => fetchTableData(table.name)} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                `Fetch ${table.label} Data`
              )}
            </Button>
          ) : tableInfo.data.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data Found</AlertTitle>
              <AlertDescription>
                No records found in the {table.label} table. This could indicate that the sync didn't work properly.
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              <Alert variant="default" className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Data Found</AlertTitle>
                <AlertDescription>
                  Found {tableInfo.count} records in the {table.label} table.
                </AlertDescription>
              </Alert>
              <div className="overflow-auto max-h-60">
                <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(tableInfo.data[0], null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">QQCatalyst Data Verification</h1>
        <Button onClick={fetchAllTables} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking All Tables...
            </>
          ) : (
            "Check All Tables"
          )}
        </Button>
      </div>

      <Alert className="mb-6">
        <Database className="h-4 w-4" />
        <AlertTitle>Data Verification Tool</AlertTitle>
        <AlertDescription>
          This tool helps you verify that data from QQCatalyst has been properly synced to your database. Use this to
          troubleshoot when data isn't showing up in the UI.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="tables" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tables">Database Tables</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tables.map((table) => (
              <TableCard key={table.name} table={table} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Diagnostics</CardTitle>
              <CardDescription>Check the data flow from QQCatalyst to your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const res = await fetch("/api/qqcatalyst/debug")
                      const data = await res.json()
                      setTableData((prev) => ({
                        ...prev,
                        diagnostics: data,
                      }))
                    } catch (err) {
                      setError(`Diagnostics failed: ${err.message}`)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Diagnostics...
                    </>
                  ) : (
                    "Run Diagnostics"
                  )}
                </Button>

                {tableData.diagnostics && (
                  <div className="mt-4">
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-[500px]">
                      {JSON.stringify(tableData.diagnostics, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
