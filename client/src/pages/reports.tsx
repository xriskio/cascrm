import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import { getReportStats } from "@/lib/actions/report-actions"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { range?: string }
}) {
  // Get date range from query params, default to 30 days
  const dateRange = searchParams.range || "30"
  
  // Fetch data with the selected range
  const stats = await getReportStats(dateRange)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6">
        <ReportsDashboard initialStats={stats} selectedRange={dateRange} />
      </div>
    </div>
  )
}
