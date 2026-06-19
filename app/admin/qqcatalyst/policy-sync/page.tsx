"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { syncPoliciesAction, syncAllPoliciesInDateRangeAction } from "@/app/actions/policy-sync-actions"
import { fetchPoliciesLastModified } from "@/lib/qqcatalyst/api"

export default function PolicySyncPage() {
  const [startDate, setStartDate] = useState("2024-01-01")
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [pageSize, setPageSize] = useState(10)
  const [pageNumber, setPageNumber] = useState(1)
  const [maxPages, setMaxPages] = useState(5)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState("")
  const [syncStats, setSyncStats] = useState<any | null>(null)
  const [previewData, setPreviewData] = useState<any | null>(null)

  const handlePreview = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetchPoliciesLastModified({
        startDate,
        endDate,
        pageNumber,
        pageSize,
      })

      if (response.isSuccess) {
        setPreviewData(response)
        setMessage(`Preview loaded: ${response.data.length} policies found`)
      } else {
        setMessage(`Error: ${response.errorMessage}`)
        setPreviewData(null)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setPreviewData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncPage = async () => {
    setSyncing(true)
    setMessage("")

    try {
      const result = await syncPoliciesAction({
        startDate,
        endDate,
        pageNumber,
        pageSize,
      })

      setMessage(result.message)
      setSyncStats(result.stats)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    setMessage("")

    try {
      const result = await syncAllPoliciesInDateRangeAction({
        startDate,
        endDate,
        maxPages,
      })

      setMessage(result.message)
      setSyncStats(result.stats)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QQCatalyst Policy Sync</h1>
        <p className="text-muted-foreground">
          Synchronize policies from QQCatalyst using the LastModifiedCreated endpoint
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
          <CardDescription>Configure date range and pagination settings for policy synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pageSize">Page Size</Label>
              <Input
                id="pageSize"
                type="number"
                min="1"
                max="100"
                value={pageSize}
                onChange={(e) => setPageSize(Number.parseInt(e.target.value) || 10)}
              />
            </div>
            <div>
              <Label htmlFor="pageNumber">Page Number</Label>
              <Input
                id="pageNumber"
                type="number"
                min="1"
                value={pageNumber}
                onChange={(e) => setPageNumber(Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="maxPages">Max Pages (Bulk Sync)</Label>
              <Input
                id="maxPages"
                type="number"
                min="1"
                max="20"
                value={maxPages}
                onChange={(e) => setMaxPages(Number.parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} disabled={loading} variant="outline">
              {loading ? "Loading..." : "Preview Data"}
            </Button>
            <Button onClick={handleSyncPage} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync Single Page"}
            </Button>
            <Button onClick={handleSyncAll} disabled={syncing} variant="secondary">
              {syncing ? "Syncing..." : "Sync All Pages"}
            </Button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.includes("Error") || message.includes("Failed")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          {syncStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{syncStats.imported}</div>
                <div className="text-sm text-gray-600">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncStats.updated}</div>
                <div className="text-sm text-gray-600">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{syncStats.errors}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{syncStats.totalFetched || syncStats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Preview Data
              <Badge variant="outline">
                Page {previewData.pageNumber} of {previewData.pagesTotal}
              </Badge>
              <Badge variant="secondary">{previewData.totalItems} total items</Badge>
            </CardTitle>
            <CardDescription>Preview of policies that will be synchronized</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewData.data.slice(0, 5).map((policy: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{policy.PolicyNumber}</h3>
                      <p className="text-sm text-gray-600">{policy.CustomerName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={policy.IsDeleted ? "destructive" : "default"}>{policy.Status}</Badge>
                      {policy.HasBeenModified && <Badge variant="outline">Modified</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Agent:</span> {policy.AgentName}
                    </div>
                    <div>
                      <span className="font-medium">Carrier:</span> {policy.WritingCarrier}
                    </div>
                    <div>
                      <span className="font-medium">LOB:</span> {policy.LOB}
                    </div>
                    <div>
                      <span className="font-medium">Premium:</span> ${policy.TotalPremium?.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {policy.CreatedOn} | Modified: {policy.DateLastModified}
                  </div>
                </div>
              ))}
              {previewData.data.length > 5 && (
                <div className="text-center text-gray-500">... and {previewData.data.length - 5} more policies</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
