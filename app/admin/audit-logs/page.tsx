import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { Eye, FileEdit, FilePlus, Trash2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AuditLogsPage() {
  const supabase = createClient({ useServiceRole: true })

  // Fetch the most recent 100 audit logs
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching audit logs:", error)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">Error loading audit logs: {error.message}</p>
        </div>
      </div>
    )
  }

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <FilePlus className="h-4 w-4 text-green-500" />
      case "update":
        return <FileEdit className="h-4 w-4 text-blue-500" />
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "view":
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  // Format table name for display
  const formatTableName = (tableName: string) => {
    return tableName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date & Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Table
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Record ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  IP Address
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user_name || "Unknown User"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="ml-2 capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTableName(log.table_name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {typeof log.record_id === "string" && log.record_id.length > 8
                        ? `${log.record_id.substring(0, 8)}...`
                        : log.record_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip_address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/audit-logs/${log.id}`} className="text-orange-600 hover:text-orange-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
