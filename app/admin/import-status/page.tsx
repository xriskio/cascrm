"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ImportStatusPage() {
  const [status, setStatus] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const checkImportStatus = async () => {
    setLoading(true)
    try {
      // Check each table for data
      const tables = [
        { name: "contacts", label: "QQCatalyst Contacts" },
        { name: "policies", label: "QQCatalyst Policies" },
        { name: "clients", label: "Manual Clients" },
        { name: "qqcatalyst_contact_accounts", label: "Contact Accounts" },
        { name: "customer_details", label: "Customer Details" },
      ]

      const results: Record<string, any> = {}

      for (const table of tables) {
        try {
          const { count, error } = await (supabase as any).from(table.name).select("*", { count: "exact", head: true })

          results[table.name] = {
            label: table.label,
            count: count || 0,
            status: error ? "error" : count > 0 ? "success" : "empty",
            error: error?.message,
          }
        } catch (err) {
          results[table.name] = {
            label: table.label,
            count: 0,
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          }
        }
      }

      setStatus(results)
    } catch (error) {
      console.error("Error checking import status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkImportStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "empty":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "empty":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Status</h1>
          <p className="text-gray-600">Check the status of your QQCatalyst data imports</p>
        </div>
        <Button onClick={checkImportStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(status).map(([tableName, info]) => (
          <Card key={tableName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{info.label}</span>
                {getStatusIcon(info.status)}
              </CardTitle>
              <CardDescription>Database table: {tableName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Records:</span>
                  <Badge variant="outline">{info.count}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge className={getStatusColor(info.status)}>
                    {info.status === "success" ? "Has Data" : info.status === "empty" ? "No Data" : "Error"}
                  </Badge>
                </div>
                {info.error && <div className="text-xs text-red-500 mt-2">Error: {info.error}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Import data or troubleshoot issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild>
              <Link href="/admin/qqcatalyst/import">Import from QQCatalyst</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/debug/data">View Raw Data</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/qqcatalyst/data-verification">Verify Data</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
