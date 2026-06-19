// Helper function to properly format dates
export function formatDateForDatabase(dateValue: any): string | null {
  if (!dateValue) return null

  try {
    // Handle Excel date numbers (which are days since 1900-01-01)
    if (typeof dateValue === "number") {
      // Excel date serial number to JS date
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch)
      date.setDate(excelEpoch.getDate() + dateValue)
      return date.toISOString().split("T")[0] // YYYY-MM-DD format
    }

    // Handle string dates in various formats
    if (typeof dateValue === "string") {
      // Handle M/D/YYYY format (your format: 9/1/2024, 9/1/2025, etc.)
      const mdyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      const mdyyyyMatch = dateValue.trim().match(mdyyyy)
      if (mdyyyyMatch) {
        const [_, month, day, year] = mdyyyyMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Handle MM/DD/YYYY format
      const mmddyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const mmddyyyyMatch = dateValue.trim().match(mmddyyyy)
      if (mmddyyyyMatch) {
        const [_, month, day, year] = mmddyyyyMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Handle M-D-YYYY format
      const mdyyyyDash = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      const mdyyyyDashMatch = dateValue.trim().match(mdyyyyDash)
      if (mdyyyyDashMatch) {
        const [_, month, day, year] = mdyyyyDashMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Handle YYYY-MM-DD format (ISO)
      const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
      const yyyymmddMatch = dateValue.trim().match(yyyymmdd)
      if (yyyymmddMatch) {
        const [_, year, month, day] = yyyymmddMatch
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      }

      // Try to parse as a general date string
      const date = new Date(dateValue)
      if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
        return date.toISOString().split("T")[0]
      }
    }

    // Handle Date objects
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toISOString().split("T")[0]
      }
    }

    // If we get here, we couldn't parse the date
    console.error("Could not parse date:", dateValue, typeof dateValue)
    return null
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateValue)
    return null
  }
}
