// CSV Export Utility

export function exportToCSV(data: any[], headers: string[], filename: string) {
  if (!data || data.length === 0) {
    return
  }

  // Create CSV header row
  const csvHeaders = headers.join(",")

  // Create CSV data rows
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = getNestedValue(row, header)
        // Escape commas and quotes in values
        if (value === null || value === undefined) return ""
        const stringValue = String(value)
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(",")
  })

  // Combine headers and rows
  const csv = [csvHeaders, ...csvRows].join("\n")

  // Create and download the file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Helper function to get nested values from objects
function getNestedValue(obj: any, key: string): any {
  // Handle nested keys like "client.name"
  if (key.includes(".")) {
    const keys = key.split(".")
    let value = obj
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return ""
    }
    return value
  }

  // Handle array index notation
  const match = key.match(/(\w+)\[(\d+)\]/)
  if (match) {
    const [, arrayKey, index] = match
    return obj[arrayKey]?.[parseInt(index)]
  }

  return obj[key]
}

// Format data for export based on report type
export function formatReportData(
  reportType: "submissions" | "clients" | "policies",
  data: any[]
): { data: any[]; headers: string[]; filename: string } {
  switch (reportType) {
    case "submissions":
      return {
        data,
        headers: [
          "submission_id",
          "client_name",
          "policy_type",
          "status",
          "premium",
          "effective_date",
          "created_at",
        ],
        filename: "submissions_report",
      }

    case "clients":
      return {
        data,
        headers: ["id", "name", "email", "phone", "created_at"],
        filename: "clients_report",
      }

    case "policies":
      return {
        data,
        headers: [
          "policy_number",
          "insured_name",
          "insurance_carrier",
          "policy_type",
          "expiring_premium",
          "expiration_date",
          "created_at",
        ],
        filename: "policies_report",
      }

    default:
      return { data, headers: [], filename: "export" }
  }
}
