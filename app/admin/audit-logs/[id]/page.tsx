import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { ArrowLeft, FileEdit, FilePlus, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AuditLogDetailPage({ params }: { params: { id: string } }) {
  const supabase = (createClient as any)({ useServiceRole: true })

  // Fetch the audit log
  const { data: log, error } = await supabase.from("audit_logs").select("*").eq("id", params.id).single()

  if (error || !log) {
    console.error("Error fetching audit log:", error)
    notFound()
  }

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <FilePlus className="h-5 w-5 text-green-500" />
      case "update":
        return <FileEdit className="h-5 w-5 text-blue-500" />
      case "delete":
        return <Trash2 className="h-5 w-5 text-red-500" />
      case "view":
        return <Eye className="h-5 w-5 text-muted-foreground" />
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

  // Format JSON data for display
  const formatJsonData = (data: any) => {
    if (!data) return "No data"

    try {
      // If it's already an object, use it directly
      const jsonObj = typeof data === "object" ? data : JSON.parse(data)

      // Remove sensitive fields
      const sanitized = { ...jsonObj }
      if (sanitized.password) sanitized.password = "********"

      return JSON.stringify(sanitized, null, 2)
    } catch (e) {
      console.error("Error formatting JSON:", e)
      return String(data)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/audit-logs" className="flex items-center text-orange-600 hover:text-orange-300">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Audit Logs
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          {getActionIcon(log.action)}
          <h1 className="text-2xl font-bold ml-2 capitalize">
            {log.action} {formatTableName(log.table_name)}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase mb-2">Details</h2>
            <div className="bg-muted rounded-md p-4">
              <dl className="divide-y divide-border">
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Date & Time</dt>
                  <dd className="text-sm text-foreground">{format(new Date(log.created_at), "PPpp")}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">User</dt>
                  <dd className="text-sm text-foreground">{log.user_name || "Unknown User"}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Table</dt>
                  <dd className="text-sm text-foreground">{formatTableName(log.table_name)}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Record ID</dt>
                  <dd className="text-sm font-mono text-foreground">{log.record_id}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">IP Address</dt>
                  <dd className="text-sm text-foreground">{log.ip_address}</dd>
                </div>
              </dl>
            </div>
          </div>

          {log.action === "update" && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase mb-2">Changes</h2>
              <div className="bg-muted rounded-md p-4 max-h-60 overflow-y-auto">
                <ul className="divide-y divide-border">
                  {log.old_data &&
                    log.new_data &&
                    Object.keys(log.new_data)
                      .map((key) => {
                        const oldValue = log.old_data[key]
                        const newValue = log.new_data[key]

                        // Skip if values are the same or if they're both null/undefined
                        if (oldValue === newValue || (oldValue == null && newValue == null)) {
                          return null
                        }

                        return (
                          <li key={key} className="py-2">
                            <div className="text-sm font-medium text-foreground">{key}</div>
                            <div className="mt-1 flex flex-col sm:flex-row">
                              <div className="text-sm text-red-500 line-through sm:w-1/2">
                                {oldValue === null
                                  ? "null"
                                  : oldValue === undefined
                                    ? "undefined"
                                    : typeof oldValue === "object"
                                      ? JSON.stringify(oldValue)
                                      : String(oldValue)}
                              </div>
                              <div className="text-sm text-green-500 sm:w-1/2">
                                {newValue === null
                                  ? "null"
                                  : newValue === undefined
                                    ? "undefined"
                                    : typeof newValue === "object"
                                      ? JSON.stringify(newValue)
                                      : String(newValue)}
                              </div>
                            </div>
                          </li>
                        )
                      })
                      .filter(Boolean)}
                  {(!log.old_data ||
                    !log.new_data ||
                    Object.keys(log.new_data).filter((key) => {
                      const oldValue = log.old_data?.[key]
                      const newValue = log.new_data?.[key]
                      return (
                        oldValue !== newValue ||
                        (oldValue == null && newValue != null) ||
                        (oldValue != null && newValue == null)
                      )
                    }).length === 0) && <li className="py-2 text-sm text-muted-foreground">No visible changes detected</li>}
                </ul>
              </div>
            </div>
          )}
        </div>

        {log.action !== "delete" && log.new_data && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase mb-2">
              {log.action === "create" ? "Created Data" : "Current Data"}
            </h2>
            <div className="bg-muted rounded-md p-4">
              <pre className="text-xs overflow-x-auto max-h-96 overflow-y-auto">{formatJsonData(log.new_data)}</pre>
            </div>
          </div>
        )}

        {log.action === "delete" && log.old_data && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase mb-2">Deleted Data</h2>
            <div className="bg-muted rounded-md p-4">
              <pre className="text-xs overflow-x-auto max-h-96 overflow-y-auto">{formatJsonData(log.old_data)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
