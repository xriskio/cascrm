"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, Database } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

const SAMPLE_QUERIES = [
  {
    name: "Contact Summary",
    query: `SELECT 
  COUNT(*) as total_contacts,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as contacts_with_email,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as contacts_with_phone
FROM contacts;`,
  },
  {
    name: "Policies by Line of Business",
    query: `SELECT 
  line_of_business,
  COUNT(*) as policy_count
FROM policies 
WHERE line_of_business IS NOT NULL
GROUP BY line_of_business
ORDER BY policy_count DESC;`,
  },
  {
    name: "Recent Activity",
    query: `SELECT 
  'contacts' as table_name,
  COUNT(*) as records,
  MAX(updated_at) as last_updated
FROM contacts
UNION ALL
SELECT 
  'policies' as table_name,
  COUNT(*) as records,
  MAX(updated_at) as last_updated
FROM policies
ORDER BY last_updated DESC;`,
  },
]

export default function SQLQueriesPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeQuery = async (sqlQuery: string) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Note: This is a simplified example. In production, you'd want to use
      // a secure server-side endpoint for running custom SQL queries
      const { data, error } = await (supabase as any).rpc("execute_sql", { sql_query: sqlQuery })

      if (error) {
        setError(error.message)
      } else {
        setResults(data)
      }
    } catch (err) {
      setError("Failed to execute query. Custom SQL execution may not be enabled.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Database className="mr-3" />
          SQL Query Tool
        </h1>
        <p className="text-muted-foreground">Run custom SQL queries on your QQCatalyst data</p>
      </div>

      {/* Sample Queries */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sample Queries</CardTitle>
          <CardDescription>Click any query to load it into the editor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_QUERIES.map((sample, index) => (
              <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => setQuery(sample.query)}>
                <CardContent className="p-4">
                  <h4 className="font-medium">{sample.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sample.query.split("\n")[0].substring(0, 50)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Query Editor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Query Editor</CardTitle>
          <CardDescription>Write and execute SQL queries</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="SELECT * FROM contacts LIMIT 10;"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={8}
            className="font-mono"
          />
          <Button onClick={() => executeQuery(query)} disabled={!query.trim() || loading} className="mt-4">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Execute Query
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Query Results
              <Badge variant="secondary" className="ml-2">
                {results.length} rows
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(results[0]).map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{value !== null ? String(value) : "-"}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No results found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
