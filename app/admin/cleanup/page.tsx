"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Database, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { deleteAllClients, deleteAllClientRelatedData, getDataCounts } from "@/app/actions/cleanup-actions"
import { useEffect } from "react"

export default function DatabaseCleanupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [counts, setCounts] = useState<any>(null)
  const [loadingCounts, setLoadingCounts] = useState(true)

  // Load current data counts
  useEffect(() => {
    const loadCounts = async () => {
      try {
        setLoadingCounts(true)
        const response = await getDataCounts()
        if (response.success) {
          setCounts(response.data)
        }
      } catch (error) {
        console.error("Error loading counts:", error)
      } finally {
        setLoadingCounts(false)
      }
    }

    loadCounts()
  }, [])

  const handleDeleteClients = async () => {
    if (!confirm("Are you sure you want to delete ALL clients? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      setResult(null)
      const response = await deleteAllClients()
      setResult(response)

      // Refresh counts
      const countsResponse = await getDataCounts()
      if (countsResponse.success) {
        setCounts(countsResponse.data)
      }
    } catch (error) {
      console.error("Error deleting clients:", error)
      setResult({ success: false, error: "Failed to delete clients" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL client-related data (clients, policies, renewals, quotes, tasks)? This action cannot be undone.",
      )
    ) {
      return
    }

    if (!confirm("This will completely wipe your database clean. Are you absolutely sure?")) {
      return
    }

    try {
      setLoading(true)
      setResult(null)
      const response = await deleteAllClientRelatedData()
      setResult(response)

      // Refresh counts
      const countsResponse = await getDataCounts()
      if (countsResponse.success) {
        setCounts(countsResponse.data)
      }
    } catch (error) {
      console.error("Error deleting all data:", error)
      setResult({ success: false, error: "Failed to delete all data" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Cleanup</h1>
        <p className="text-gray-600">Prepare your database for QQCatalyst import by removing existing data</p>
      </div>

      {/* Warning Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Warning:</strong> These operations permanently delete data and cannot be undone. Make sure you have
          backups if needed before proceeding.
        </AlertDescription>
      </Alert>

      {/* Current Data Counts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Current Database Status
          </CardTitle>
          <CardDescription>Overview of existing data in your database</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCounts ? (
            <div className="flex items-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading data counts...
            </div>
          ) : counts ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{counts.clients}</div>
                <div className="text-sm text-gray-600">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{counts.policies}</div>
                <div className="text-sm text-gray-600">Policies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{counts.renewals}</div>
                <div className="text-sm text-gray-600">Renewals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{counts.quotes}</div>
                <div className="text-sm text-gray-600">Quotes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{counts.tasks}</div>
                <div className="text-sm text-gray-600">Tasks</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Failed to load data counts</div>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Delete Clients Only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Delete All Clients</CardTitle>
            <CardDescription>Remove all clients from the database while keeping other data intact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              This will delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All client records</li>
                <li>Client contact information</li>
                <li>Client business details</li>
              </ul>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteClients}
              disabled={loading || (counts && counts.clients === 0)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Clients ({counts?.clients || 0})
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Delete All Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Complete Database Wipe</CardTitle>
            <CardDescription>Remove all client-related data to start completely fresh</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              This will delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All clients ({counts?.clients || 0})</li>
                <li>All policies ({counts?.policies || 0})</li>
                <li>All renewals ({counts?.renewals || 0})</li>
                <li>All quotes ({counts?.quotes || 0})</li>
                <li>All tasks ({counts?.tasks || 0})</li>
              </ul>
            </div>
            <Button variant="destructive" onClick={handleDeleteAllData} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Everything
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result Display */}
      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
            {result.success ? (
              <div>
                <strong>Success!</strong> {result.message}
                {result.data && (
                  <div className="mt-2 text-sm">Deleted: {result.data.deleted || result.data.total} records</div>
                )}
              </div>
            ) : (
              <div>
                <strong>Error:</strong> {result.error || result.message}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>After cleaning up your database, you can import fresh data from QQCatalyst</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">1. Clean up existing data using the options above</p>
            <p className="text-sm text-gray-600">2. Go to QQCatalyst sync to import fresh client and policy data</p>
            <p className="text-sm text-gray-600">3. Verify the imported data in your client dashboard</p>
          </div>
          <Button className="mt-4" asChild>
            <a href="/admin/qqcatalyst/sync">Import from QQCatalyst</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
