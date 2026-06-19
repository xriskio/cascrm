import { fetchRenewalPolicies } from "./qqcatalyst/renewals-api"

/**
 * Preview renewal data from QQCatalyst API for the specified date range
 */
export async function previewRenewalData(params: {
  startDate: Date
  endDate: Date
  pageSize: number
}) {
  try {
    const startDateStr = params.startDate.toISOString().split("T")[0]
    const endDateStr = params.endDate.toISOString().split("T")[0]

    const response = await fetchRenewalPolicies({
      startDate: startDateStr,
      endDate: endDateStr,
      pageSize: params.pageSize,
      pageNumber: 1,
    })

    if (!response.isSuccess) {
      return {
        success: false,
        error: response.errorMessage || "Failed to fetch renewal data from QQCatalyst",
      }
    }

    return {
      success: true,
      data: response.data,
      totalItems: response.totalItems,
    }
  } catch (error) {
    console.error("Error in previewRenewalData:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Import renewal data using the provided field mappings
 * This now calls the server action directly from the client
 */
export async function importRenewalData(params: {
  startDate: Date
  endDate: Date
  fieldMappings: Record<string, string>
}) {
  try {
    const startDateStr = params.startDate.toISOString().split("T")[0]
    const endDateStr = params.endDate.toISOString().split("T")[0]

    const { importRenewalsFromQQ } = await import("@/lib/actions/renewal-import-enhanced-actions")

    const result = await importRenewalsFromQQ({
      startDate: startDateStr,
      endDate: endDateStr,
      fieldMappings: params.fieldMappings,
      maxRecords: 1000,
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to import renewal data",
      }
    }

    return {
      success: true,
      totalRecords: result.importedCount || 0,
      importedCount: result.importedCount,
      errorCount: result.errorCount,
      errors: result.errors,
    }
  } catch (error) {
    console.error("Error in importRenewalData:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
