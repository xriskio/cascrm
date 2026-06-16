"use server"

import { createClient } from "@/lib/supabase/server"

export interface ReportStats {
  totalRevenue: number
  revenueChange: number
  activePolicies: number
  policiesChange: number
  newClients: number
  clientsChange: number
  conversionRate: number
  conversionChange: number
}

export interface SubmissionReport {
  total: number
  byType: { type: string; count: number }[]
  byStatus: { status: string; count: number }[]
  recentSubmissions: any[]
}

export interface ClientReport {
  total: number
  newThisMonth: number
  bySource: { source: string; count: number }[]
  topClients: any[]
}

export interface PolicyReport {
  total: number
  byCarrier: { carrier: string; count: number; premium: number }[]
  byType: { type: string; count: number }[]
  expiringSoon: any[]
}

// Get overall statistics for the dashboard
export async function getReportStats(dateRange: string = "30"): Promise<ReportStats> {
  const supabase = await createClient()
  const daysAgo = parseInt(dateRange)
  const currentPeriodStart = new Date()
  currentPeriodStart.setDate(currentPeriodStart.getDate() - daysAgo)
  
  const previousPeriodStart = new Date()
  previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysAgo * 2))
  const previousPeriodEnd = new Date(currentPeriodStart)

  // Get renewals data for revenue calculation
  const { data: currentRenewals } = await supabase
    .from("renewals")
    .select("expiring_premium")
    .gte("created_at", currentPeriodStart.toISOString())

  const { data: previousRenewals } = await supabase
    .from("renewals")
    .select("expiring_premium")
    .gte("created_at", previousPeriodStart.toISOString())
    .lt("created_at", previousPeriodEnd.toISOString())

  // Calculate revenue
  const currentRevenue = (currentRenewals || []).reduce(
    (sum, r) => sum + (parseFloat(r.expiring_premium as any) || 0),
    0
  )
  const previousRevenue = (previousRenewals || []).reduce(
    (sum, r) => sum + (parseFloat(r.expiring_premium as any) || 0),
    0
  )
  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

  // Get active policies count
  const { count: activePoliciesCount } = await supabase
    .from("policies")
    .select("*", { count: "exact", head: true })

  const { count: previousPoliciesCount } = await supabase
    .from("policies")
    .select("*", { count: "exact", head: true })
    .lt("created_at", previousPeriodEnd.toISOString())

  const policiesChange = previousPoliciesCount
    ? ((activePoliciesCount || 0) - previousPoliciesCount) / previousPoliciesCount * 100
    : 0

  // Get new clients
  const { count: newClientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .gte("created_at", currentPeriodStart.toISOString())

  const { count: previousClientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .gte("created_at", previousPeriodStart.toISOString())
    .lt("created_at", previousPeriodEnd.toISOString())

  const clientsChange = previousClientsCount
    ? ((newClientsCount || 0) - previousClientsCount) / previousClientsCount * 100
    : 0

  // Get conversion rate (submissions to bound policies)
  const { count: submissionsCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", currentPeriodStart.toISOString())

  const { count: boundCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "bound")
    .gte("created_at", currentPeriodStart.toISOString())

  const conversionRate = submissionsCount ? (boundCount || 0) / submissionsCount * 100 : 0

  const { count: prevSubmissionsCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", previousPeriodStart.toISOString())
    .lt("created_at", previousPeriodEnd.toISOString())

  const { count: prevBoundCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "bound")
    .gte("created_at", previousPeriodStart.toISOString())
    .lt("created_at", previousPeriodEnd.toISOString())

  const prevConversionRate = prevSubmissionsCount ? (prevBoundCount || 0) / prevSubmissionsCount * 100 : 0
  const conversionChange = prevConversionRate > 0 ? conversionRate - prevConversionRate : 0

  return {
    totalRevenue: currentRevenue,
    revenueChange,
    activePolicies: activePoliciesCount || 0,
    policiesChange,
    newClients: newClientsCount || 0,
    clientsChange,
    conversionRate,
    conversionChange,
  }
}

// Get submission report data
export async function getSubmissionReport(dateRange: string = "30"): Promise<SubmissionReport> {
  const supabase = await createClient()
  const daysAgo = parseInt(dateRange)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })

  if (!submissions) {
    return {
      total: 0,
      byType: [],
      byStatus: [],
      recentSubmissions: [],
    }
  }

  // Group by type
  const byTypeMap = new Map<string, number>()
  submissions.forEach((s) => {
    const type = s.policy_type || "Unknown"
    byTypeMap.set(type, (byTypeMap.get(type) || 0) + 1)
  })
  const byType = Array.from(byTypeMap.entries()).map(([type, count]) => ({ type, count }))

  // Group by status
  const byStatusMap = new Map<string, number>()
  submissions.forEach((s) => {
    const status = s.status || "pending"
    byStatusMap.set(status, (byStatusMap.get(status) || 0) + 1)
  })
  const byStatus = Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count }))

  return {
    total: submissions.length,
    byType,
    byStatus,
    recentSubmissions: submissions.slice(0, 10),
  }
}

// Get client report data
export async function getClientReport(dateRange: string = "30"): Promise<ClientReport> {
  const supabase = await createClient()
  const daysAgo = parseInt(dateRange)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)

  const { count: totalClients } = await supabase.from("clients").select("*", { count: "exact", head: true })

  const { count: newClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDate.toISOString())

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })
    .limit(100)

  // Group by source (if available)
  const bySourceMap = new Map<string, number>()
  ;(clients || []).forEach((c) => {
    const source = c.source || "Direct"
    bySourceMap.set(source, (bySourceMap.get(source) || 0) + 1)
  })
  const bySource = Array.from(bySourceMap.entries()).map(([source, count]) => ({ source, count }))

  return {
    total: totalClients || 0,
    newThisMonth: newClients || 0,
    bySource,
    topClients: (clients || []).slice(0, 10),
  }
}

// Get policy report data
export async function getPolicyReport(dateRange: string = "30"): Promise<PolicyReport> {
  const supabase = await createClient()
  const daysAgo = parseInt(dateRange)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)

  const { count: totalPolicies } = await supabase.from("policies").select("*", { count: "exact", head: true })

  const { data: renewals } = await supabase
    .from("renewals")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .order("expiration_date", { ascending: true })
    .limit(200)

  if (!renewals) {
    return {
      total: totalPolicies || 0,
      byCarrier: [],
      byType: [],
      expiringSoon: [],
    }
  }

  // Group by carrier
  const byCarrierMap = new Map<string, { count: number; premium: number }>()
  renewals.forEach((r) => {
    const carrier = r.insurance_carrier || "Unknown"
    const existing = byCarrierMap.get(carrier) || { count: 0, premium: 0 }
    byCarrierMap.set(carrier, {
      count: existing.count + 1,
      premium: existing.premium + (parseFloat(r.expiring_premium as any) || 0),
    })
  })
  const byCarrier = Array.from(byCarrierMap.entries()).map(([carrier, data]) => ({
    carrier,
    count: data.count,
    premium: data.premium,
  }))

  // Group by type
  const byTypeMap = new Map<string, number>()
  renewals.forEach((r) => {
    const type = r.policy_type || "Unknown"
    byTypeMap.set(type, (byTypeMap.get(type) || 0) + 1)
  })
  const byType = Array.from(byTypeMap.entries()).map(([type, count]) => ({ type, count }))

  // Get expiring soon (next 30 days)
  const expiringDate = new Date()
  expiringDate.setDate(expiringDate.getDate() + 30)

  const { data: expiringSoon } = await supabase
    .from("renewals")
    .select("*")
    .lte("expiration_date", expiringDate.toISOString())
    .gte("expiration_date", new Date().toISOString())
    .order("expiration_date", { ascending: true })
    .limit(10)

  return {
    total: totalPolicies || 0,
    byCarrier,
    byType,
    expiringSoon: expiringSoon || [],
  }
}

// Export data as CSV
export async function exportReportData(reportType: string, dateRange: string = "30") {
  const supabase = await createClient()
  const daysAgo = parseInt(dateRange)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)

  let data: any[] = []
  let headers: string[] = []

  switch (reportType) {
    case "submissions":
      const { data: submissions } = await supabase
        .from("submissions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      data = submissions || []
      headers = ["Submission ID", "Client Name", "Policy Type", "Status", "Premium", "Created Date"]
      break

    case "clients":
      const { data: clients } = await supabase
        .from("clients")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      data = clients || []
      headers = ["Client ID", "Name", "Email", "Phone", "Created Date"]
      break

    case "policies":
      const { data: renewals } = await supabase
        .from("renewals")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      data = renewals || []
      headers = ["Policy Number", "Insured Name", "Carrier", "Type", "Premium", "Expiration Date"]
      break

    default:
      return null
  }

  return { data, headers }
}
