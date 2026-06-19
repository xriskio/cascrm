"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Database } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function DatabaseDebugPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const checkAllTables = async () => {
    setLoading(true)
    setError(null)
    const tableResults: any = {}

    try {
      // List of tables to check
      const tablesToCheck = [
        "contacts",
        "policies",
        "clients",
        "qqcatalyst_contacts",
        "qqcatalyst_policies",
        "qqcatalyst_policy_details",
        "renewals",
        "submissions",
        "leads",
        "quotes",
      ]

      for (const table of tablesToCheck) {
        try {
          console.log(`Checking table: ${table}`)

          // Get count
          const { count, error: countError } = await (supabase as any).from(table).select("*", { count: "exact", head: true })

          if (countError) {
            tableResults[table] = { error: countError.message, count: 0, sample: [] }
            continue
          }

          // Get sample data (first 3 records)
          const { data: sampleData, error: sampleError } = await (supabase as any).from(table).select("*").limit(3)

          tableResults[table] = {
            count: count || 0,
            sample: sampleData || [],
            error: sampleError?.message || null,
            columns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
          }
        } catch (err) {
          console.error(`Error checking table ${table}:`, err)
          tableResults[table] = {
            error: err instanceof Error ? err.message : String(err),
            count: 0,
            sample: [],
          }
        }
      }

      setResults(tableResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAllTables()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Debug</h1>
          <p className="text-muted-foreground">Check what data is actually in your database tables</p>
        </div>
        <Button onClick={checkAllTables} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(results).map(([tableName, tableData]: [string, any]) => (
          <Card key={tableName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  {tableName}
                </span>
                <span className={`text-lg font-bold ${tableData.count > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                  {tableData.count}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tableData.error ? (
                <div className="text-red-600 text-sm">Error: {tableData.error}</div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Records: {tableData.count}</div>
                    <div className="text-sm text-muted-foreground">Columns: {tableData.columns?.length || 0}</div>
                  </div>

                  {tableData.columns && tableData.columns.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Columns:</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {tableData.columns.slice(0, 8).map((col: string) => (
                          <div key={col} className="bg-muted px-2 py-1 rounded text-xs">
                            {col}
                          </div>
                        ))}
                        {tableData.columns.length > 8 && (
                          <div className="text-muted-foreground">... and {tableData.columns.length - 8} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {tableData.sample && tableData.sample.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Sample Data:</div>
                      <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(tableData.sample[0], null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(results).reduce((sum: number, table: any) => sum + (table.count || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(results).filter((table: any) => table.count > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Tables with Data</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {Object.values(results).filter((table: any) => table.error).length}
              </div>
              <div className="text-sm text-muted-foreground">Tables with Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Object.keys(results).length}</div>
              <div className="text-sm text-muted-foreground">Tables Checked</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
