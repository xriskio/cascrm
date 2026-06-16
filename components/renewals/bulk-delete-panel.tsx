"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  deleteAllRenewals,
  deleteBadDateRenewals,
  deleteDuplicateRenewals,
  getRenewalStats,
} from "@/app/actions/bulk-renewal-actions"
import { AlertTriangle, Trash2, RefreshCw, CheckCircle, XCircle, BarChart3 } from "lucide-react"

interface RenewalStats {
  total: number
  badDates: number
  goodDates: number
}

function extractErrorMessage(error: any): string {
  return error?.message || "An unexpected error occurred"
}

export default function BulkDeletePanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [stats, setStats] = useState<RenewalStats | null>(null)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      const result = await getRenewalStats()
      if (result.success) {
        setStats(result.stats)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to load statistics" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: extractErrorMessage(error) })
    }
  }

  const handleDeleteAll = async () => {
    if (showConfirm !== "all") {
      setShowConfirm("all")
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await deleteAllRenewals()
      if (result.success) {
        setMessage({ type: "success", text: result.message })
        await loadStats()
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: extractErrorMessage(error) })
    } finally {
      setIsLoading(false)
      setShowConfirm(null)
    }
  }

  const handleDeleteBadDates = async () => {
    if (showConfirm !== "badDates") {
      setShowConfirm("badDates")
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await deleteBadDateRenewals()
      if (result.success) {
        setMessage({ type: "success", text: result.message })
        await loadStats()
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: extractErrorMessage(error) })
    } finally {
      setIsLoading(false)
      setShowConfirm(null)
    }
  }

  const handleDeleteDuplicates = async () => {
    if (showConfirm !== "duplicates") {
      setShowConfirm("duplicates")
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await deleteDuplicateRenewals()
      if (result.success) {
        setMessage({ type: "success", text: result.message })
        await loadStats()
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: extractErrorMessage(error) })
    } finally {
      setIsLoading(false)
      setShowConfirm(null)
    }
  }

  // Load stats on component mount
  React.useEffect(() => {
    loadStats()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-6 w-6" />
          Bulk Delete Renewals
        </CardTitle>
        <CardDescription>
          Clean up your renewals data by removing duplicates, bad dates, or all records.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total Renewals</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Bad Dates</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.badDates}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Good Dates</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.goodDates}</div>
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Delete Bad Dates */}
          <div className="border border-orange-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-orange-900">Delete Renewals with Bad Dates</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Remove all renewals with expiration date of "Dec 31, 1969" or null dates.
                </p>
                {stats && stats.badDates > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    {stats.badDates} renewals will be deleted
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={handleDeleteBadDates}
                disabled={isLoading || !stats || stats.badDates === 0}
              >
                {showConfirm === "badDates" ? "Confirm Delete" : "Delete Bad Dates"}
                <Trash2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Delete Duplicates */}
          <div className="border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-blue-900">Delete Duplicate Renewals</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Remove duplicate renewals based on policy number and insured name (keeps the latest).
                </p>
              </div>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={handleDeleteDuplicates}
                disabled={isLoading}
              >
                {showConfirm === "duplicates" ? "Confirm Delete" : "Delete Duplicates"}
                <RefreshCw className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Delete All */}
          <div className="border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-red-900">Delete All Renewals</h3>
                <p className="text-sm text-red-700 mt-1">
                  ⚠️ This will permanently delete ALL renewal records. This action cannot be undone.
                </p>
                {stats && stats.total > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    {stats.total} renewals will be deleted
                  </Badge>
                )}
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={isLoading || !stats || stats.total === 0}
              >
                {showConfirm === "all" ? "Confirm Delete All" : "Delete All"}
                <Trash2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Refresh Stats */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadStats} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Statistics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
