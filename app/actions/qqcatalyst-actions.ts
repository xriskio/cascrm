"use server"

import { fetchRenewalPolicies } from "@/lib/qqcatalyst/renewals-api"
import { extractErrorMessage } from "@/lib/error-utils"

/**
 * Fetch expiring policies from QQCatalyst for renewal processing
 */
export async function fetchExpiringPolicies(params: {
  startDate: string
  endDate: string
  maxRecords?: number
}) {
  try {
    const { startDate, endDate, maxRecords = 1000 } = params

    console.log("Fetching expiring policies from QQCatalyst:", {
      startDate,
      endDate,
      maxRecords,
    })

    // Use the existing renewals API function
    const response = await fetchRenewalPolicies({
      startDate,
      endDate,
      pageSize: Math.min(maxRecords, 500), // QQCatalyst has page size limits
      pageNumber: 1,
    })

    if (!response.isSuccess) {
      return {
        success: false,
        error: response.errorMessage || "Failed to fetch expiring policies from QQCatalyst",
        data: null,
      }
    }

    // If we need more records and there are more pages, fetch additional pages
    let allData = [...response.data]
    let currentPage = 2

    while (allData.length < maxRecords && currentPage <= response.pagesTotal) {
      const additionalResponse = await fetchRenewalPolicies({
        startDate,
        endDate,
        pageSize: Math.min(maxRecords - allData.length, 500),
        pageNumber: currentPage,
      })

      if (additionalResponse.isSuccess && additionalResponse.data.length > 0) {
        allData.push(...additionalResponse.data)
        currentPage++
      } else {
        break
      }
    }

    // Limit to maxRecords if we got more than requested
    if (allData.length > maxRecords) {
      allData = allData.slice(0, maxRecords)
    }

    console.log(`Successfully fetched ${allData.length} expiring policies`)

    return {
      success: true,
      data: allData,
      totalRecords: allData.length,
      totalAvailable: response.totalItems,
    }
  } catch (error) {
    console.error("Error fetching expiring policies:", error)
    return {
      success: false,
      error: extractErrorMessage(error),
      data: null,
    }
  }
}
