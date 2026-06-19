"use client"

import { useState } from "react"
import { Download, BarChart3, DollarSign, Users, FileText, TrendingUp } from "lucide-react"
import type { ReportStats } from "@/app/actions/report-actions"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { exportToCSV } from "@/lib/csv-export"
import { useRouter } from "next/navigation"

interface ReportsDashboardProps {
  initialStats: ReportStats
  selectedRange: string
}

export function ReportsDashboard({ initialStats, selectedRange }: ReportsDashboardProps) {
  const router = useRouter()

  function handleDateRangeChange(newRange: string) {
    // Reload the page with new date range
    router.push(`/reports?range=${newRange}`)
  }

  async function handleExport() {
    try {
      toast({
        title: "Export Started",
        description: "Your report data is being downloaded...",
      })

      // For now, export basic stats as CSV
      const exportData = [
        {
          metric: "Total Revenue",
          value: `$${initialStats.totalRevenue.toFixed(2)}`,
          change: `${initialStats.revenueChange.toFixed(1)}%`,
        },
        {
          metric: "Active Policies",
          value: initialStats.activePolicies.toString(),
          change: `${initialStats.policiesChange.toFixed(1)}%`,
        },
        {
          metric: "New Clients",
          value: initialStats.newClients.toString(),
          change: `${initialStats.clientsChange.toFixed(1)}%`,
        },
        {
          metric: "Conversion Rate",
          value: `${initialStats.conversionRate.toFixed(1)}%`,
          change: `${initialStats.conversionChange.toFixed(1)}%`,
        },
      ]

      exportToCSV(exportData, ["metric", "value", "change"], `reports_summary_${selectedRange}days`)

      toast({
        title: "Export Complete",
        description: "Your report has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      })
    }
  }

  function formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  function formatChange(value: number): string {
    const prefix = value >= 0 ? "+" : ""
    return `${prefix}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">AI-powered insights and comprehensive business intelligence</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency(initialStats.totalRevenue)}
              </p>
              <p className={`text-sm mt-1 ${initialStats.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                ↗ {formatChange(initialStats.revenueChange)} from last period
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Policies</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {initialStats.activePolicies.toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${initialStats.policiesChange >= 0 ? "text-blue-600" : "text-red-600"}`}>
                ↗ {formatChange(initialStats.policiesChange)} from last period
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Clients</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {initialStats.newClients}
              </p>
              <p className={`text-sm mt-1 ${initialStats.clientsChange >= 0 ? "text-orange-600" : "text-red-600"}`}>
                ↗ {formatChange(initialStats.clientsChange)} from last period
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {initialStats.conversionRate.toFixed(1)}%
              </p>
              <p className={`text-sm mt-1 ${initialStats.conversionChange >= 0 ? "text-purple-600" : "text-red-600"}`}>
                ↗ {formatChange(initialStats.conversionChange)} from last period
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/reports/submissions">
          <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold ml-4 text-foreground">Submission Reports</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Comprehensive analytics on submission trends, conversion rates, and performance metrics.
            </p>
            <div className="flex items-center text-blue-500 font-medium group-hover:text-blue-600 transition-colors duration-200">
              View Analytics →
            </div>
          </div>
        </Link>

        <Link href="/reports/clients">
          <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center mb-6">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold ml-4 text-foreground">Client Reports</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Track client acquisition, retention rates, and growth trends over time.
            </p>
            <div className="flex items-center text-green-500 font-medium group-hover:text-green-600 transition-colors duration-200">
              View Analytics →
            </div>
          </div>
        </Link>

        <Link href="/reports/policies">
          <div className="group bg-card backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold ml-4 text-foreground">Policy Reports</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Analyze policy distribution, premium trends, and carrier performance.
            </p>
            <div className="flex items-center text-orange-500 font-medium group-hover:text-orange-600 transition-colors duration-200">
              View Metrics →
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
