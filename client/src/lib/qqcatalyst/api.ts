import { qqcatalystRequest } from "./client"
import type { PageOfBlobInfoDTO, BlobInfoDTO, ContactAccountInfoDTO, CustomerDetailSummaryDTO } from "./types" // Declare or import the necessary types

/**
 * Fetch contacts from QQCatalyst using the LastModifiedCreated endpoint
 */
export async function fetchContacts(
  params: {
    startDate?: string
    endDate?: string
    pageSize?: number
    pageNumber?: number
  } = {},
) {
  try {
    const queryParams = new URLSearchParams()

    // Set default date range if not provided
    const startDate = params.startDate || "2000-01-01"
    const endDate = params.endDate || new Date().toISOString().split("T")[0]

    queryParams.append("startDate", startDate)
    queryParams.append("endDate", endDate)
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 100).toString())

    // Remove leading slash from endpoint
    const endpoint = `Contacts/LastModifiedCreated?${queryParams.toString()}`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Contacts response structure:", {
      isArray: Array.isArray(response),
      keys: Object.keys(response || {}),
      length: response?.length || response?.value?.length || 0,
    })

    // Handle different response structures
    if (Array.isArray(response)) {
      return { items: response, total: response.length }
    } else if (response.value && Array.isArray(response.value)) {
      return { items: response.value, total: response.value.length }
    } else if (response.items) {
      return response
    } else {
      return { items: [], total: 0 }
    }
  } catch (error) {
    console.error("Error fetching contacts:", error)
    throw error
  }
}

/**
 * Fetch policies using the LastModifiedCreated endpoint with pagination
 */
export async function fetchPoliciesLastModified(
  params: {
    startDate?: string
    endDate?: string
    pageSize?: number
    pageNumber?: number
  } = {},
) {
  try {
    const queryParams = new URLSearchParams()

    // Set default date range if not provided
    const startDate = params.startDate || "2000-01-01"
    const endDate = params.endDate || new Date().toISOString().split("T")[0]

    queryParams.append("startDate", startDate)
    queryParams.append("endDate", endDate)
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 10).toString())

    // Remove leading slash from endpoint
    const endpoint = `Policies/LastModifiedCreated?${queryParams.toString()}`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Policies LastModified response structure:", {
      isSuccess: response?.IsSuccess,
      totalItems: response?.TotalItems,
      pageNumber: response?.PageNumber,
      pagesTotal: response?.PagesTotal,
      dataLength: response?.Data?.length || 0,
    })

    // Return the paginated response structure
    return {
      data: response?.Data || [],
      pageNumber: response?.PageNumber || 1,
      pagesTotal: response?.PagesTotal || 1,
      totalItems: response?.TotalItems || 0,
      isSuccess: response?.IsSuccess || false,
      errorCode: response?.ErrorCode,
      errorMessage: response?.ErrorMessage,
      displayMessage: response?.DisplayMessage,
      links: response?.Links || [],
      href: response?.Href,
    }
  } catch (error) {
    console.error("Error fetching policies last modified:", error)
    throw error
  }
}

/**
 * Fetch all policies from a date range with automatic pagination
 */
export async function fetchAllPoliciesInDateRange(
  params: {
    startDate?: string
    endDate?: string
    maxPages?: number
  } = {},
) {
  try {
    const allPolicies = []
    let currentPage = 1
    const maxPages = params.maxPages || 10 // Limit to prevent infinite loops
    const pageSize = 50 // Larger page size for efficiency

    while (currentPage <= maxPages) {
      const response = await fetchPoliciesLastModified({
        startDate: params.startDate,
        endDate: params.endDate,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      if (!response.isSuccess) {
        console.error("Error in pagination:", response.errorMessage)
        break
      }

      allPolicies.push(...response.data)

      // Check if we've reached the last page
      if (currentPage >= response.pagesTotal || response.data.length === 0) {
        break
      }

      currentPage++
    }

    return {
      policies: allPolicies,
      totalFetched: allPolicies.length,
      pagesFetched: currentPage - 1,
    }
  } catch (error) {
    console.error("Error fetching all policies in date range:", error)
    throw error
  }
}

/**
 * Fetch Commercial Auto Drivers for a policy detail
 */
export async function fetchCommercialAutoDrivers(policyDetailId: string | number) {
  try {
    // Remove leading slash from endpoint
    const endpoint = `Policies/Details/${policyDetailId}/CommercialAuto/Drivers`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Commercial Auto Drivers response:", {
      isArray: Array.isArray(response),
      length: Array.isArray(response) ? response.length : 0,
    })

    // Return the drivers array or empty array if no drivers
    return Array.isArray(response) ? response : []
  } catch (error) {
    console.error(`Error fetching commercial auto drivers for policy detail ${policyDetailId}:`, error)
    throw error
  }
}

/**
 * Fetch customers (alias for contacts)
 */
export async function fetchCustomers(
  params: {
    pageSize?: number
    pageNumber?: number
  } = {},
) {
  return await fetchContacts({
    pageSize: params.pageSize,
    pageNumber: params.pageNumber,
  })
}

/**
 * Fetch a specific contact by ID
 */
export async function fetchContactById(contactId: string) {
  // Remove leading slash from endpoint
  return await qqcatalystRequest(`Contacts/${contactId}`, "GET")
}

/**
 * Fetch customer by ID (alias for contact)
 */
export async function fetchCustomerById(customerId: string) {
  return await fetchContactById(customerId)
}

/**
 * Fetch policies for a specific contact
 */
export async function fetchContactPolicies(contactId: string) {
  try {
    // Remove leading slash from endpoint
    const endpoint = `Contacts/${contactId}/Policies`
    const response = await qqcatalystRequest(endpoint, "GET")

    // Handle different response structures
    if (Array.isArray(response)) {
      return { items: response, total: response.length }
    } else if (response.value && Array.isArray(response.value)) {
      return { items: response.value, total: response.value.length }
    } else if (response.items) {
      return response
    } else {
      return { items: [], total: 0 }
    }
  } catch (error) {
    console.error("Error fetching contact policies:", error)
    throw error
  }
}

/**
 * Fetch customer policies (alias)
 */
export async function fetchCustomerPolicies(customerId: string) {
  return await fetchContactPolicies(customerId)
}

/**
 * Fetch all policies by iterating through contacts
 */
export async function fetchAllPolicies(
  params: {
    pageSize?: number
    pageNumber?: number
  } = {},
) {
  try {
    // First get contacts
    const contacts = await fetchContacts(params)
    const allPolicies = []

    // Then get policies for each contact (limit to avoid rate limits)
    const contactLimit = Math.min(contacts.items?.length || 0, 5) // Limit to 5 contacts for now

    for (let i = 0; i < contactLimit; i++) {
      const contact = contacts.items[i]
      try {
        const contactPolicies = await fetchContactPolicies(contact.ContactID || contact.ID)
        allPolicies.push(...(contactPolicies.items || []))
      } catch (error) {
        console.error(`Error fetching policies for contact ${contact.ContactID || contact.ID}:`, error)
        // Continue with other contacts
      }
    }

    return { items: allPolicies, total: allPolicies.length }
  } catch (error) {
    console.error("Error fetching all policies:", error)
    throw error
  }
}

/**
 * Fetch detailed policy information by policy ID
 */
export async function fetchPolicyInfo(policyId: string | number) {
  try {
    // Remove leading slash from endpoint
    const endpoint = `Policies/${policyId}/PolicyInfo`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Policy info response structure:", {
      isArray: Array.isArray(response),
      keys: Object.keys(response || {}),
      length: response?.length || 0,
    })

    // Handle different response structures
    if (Array.isArray(response)) {
      return response[0] || null // Return first policy info if array
    } else if (response.value && Array.isArray(response.value)) {
      return response.value[0] || null
    } else {
      return response || null
    }
  } catch (error) {
    console.error(`Error fetching policy info for policy ${policyId}:`, error)
    throw error
  }
}

/**
 * Fetch policy summary information by policy ID (optimized for 3rd party devs)
 */
export async function fetchPolicySummary(policyId: string | number) {
  try {
    // Remove leading slash from endpoint
    const endpoint = `PolicySummaryForApi?policyID=${policyId}`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Policy summary response structure:", {
      keys: Object.keys(response || {}),
      hasPolicyID: !!response?.PolicyID,
    })

    return response || null
  } catch (error) {
    console.error(`Error fetching policy summary for policy ${policyId}:`, error)
    throw error
  }
}

/**
 * Fetch policy summaries for multiple policies
 */
export async function fetchMultiplePolicySummaries(policyIds: (string | number)[]) {
  try {
    const summaryPromises = policyIds.map((id) =>
      fetchPolicySummary(id).catch((error) => {
        console.error(`Failed to fetch policy summary for ${id}:`, error)
        return null
      }),
    )

    const results = await Promise.all(summaryPromises)
    return results.filter((policy) => policy !== null)
  } catch (error) {
    console.error("Error fetching multiple policy summaries:", error)
    throw error
  }
}

/**
 * Fetch detailed policy information for multiple policies
 */
export async function fetchMultiplePolicyInfo(policyIds: (string | number)[]) {
  try {
    const policyInfoPromises = policyIds.map((id) =>
      fetchPolicyInfo(id).catch((error) => {
        console.error(`Failed to fetch policy info for ${id}:`, error)
        return null
      }),
    )

    const results = await Promise.all(policyInfoPromises)
    return results.filter((policy) => policy !== null)
  } catch (error) {
    console.error("Error fetching multiple policy info:", error)
    throw error
  }
}

/**
 * Fetch enhanced policies with detailed info
 */
export async function fetchEnhancedPolicies(
  params: {
    pageSize?: number
    pageNumber?: number
  } = {},
) {
  try {
    // First get basic policies
    const basicPolicies = await fetchAllPolicies(params)

    if (!basicPolicies.items || basicPolicies.items.length === 0) {
      return { items: [], total: 0 }
    }

    // Get detailed info for each policy (limit to avoid rate limits)
    const policyLimit = Math.min(basicPolicies.items.length, 3) // Limit to 3 policies for now
    const enhancedPolicies = []

    for (let i = 0; i < policyLimit; i++) {
      const policy = basicPolicies.items[i]
      try {
        const detailedInfo = await fetchPolicyInfo(policy.PolicyID || policy.ID)
        if (detailedInfo) {
          enhancedPolicies.push({
            ...policy,
            detailedInfo,
          })
        } else {
          enhancedPolicies.push(policy)
        }
      } catch (error) {
        console.error(`Error fetching detailed info for policy ${policy.PolicyID || policy.ID}:`, error)
        enhancedPolicies.push(policy) // Include basic policy even if detailed fetch fails
      }
    }

    return { items: enhancedPolicies, total: enhancedPolicies.length }
  } catch (error) {
    console.error("Error fetching enhanced policies:", error)
    throw error
  }
}

/**
 * Fetch renewals (policies expiring soon)
 */
export async function fetchRenewals(
  params: {
    pageSize?: number
    expiresFrom?: string
    expiresTo?: string
  } = {},
) {
  try {
    // Fetch policies and filter for those expiring soon
    const policies = await fetchAllPolicies({ pageSize: params.pageSize })

    // Filter policies that are expiring
    const now = new Date()
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const renewals = policies.items.filter((policy: any) => {
      if (!policy.ExpirationDate && !policy.PolicyExpirationDate) return false
      const expirationDate = new Date(policy.ExpirationDate || policy.PolicyExpirationDate)
      return expirationDate >= now && expirationDate <= threeMonthsFromNow
    })

    return { items: renewals, total: renewals.length }
  } catch (error) {
    console.error("Error fetching renewals:", error)
    throw error
  }
}

/**
 * Test API connection
 */
export async function testConnection() {
  try {
    // Remove leading slash from endpoint
    const response = await qqcatalystRequest(
      "Contacts/LastModifiedCreated?startDate=2024-01-01&endDate=2024-12-31&pageSize=1",
      "GET",
    )
    return { success: true, data: response }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Fetch files associated with a contact ID
 */
export async function fetchContactFiles(params: {
  contactId: string
  dlFileType: string
  pageNumber?: number
  pageSize?: number
}) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("contactid", params.contactId)
    queryParams.append("dlFileType", params.dlFileType)
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 20).toString())

    const endpoint = `Files/FilesByContact?${queryParams.toString()}`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Contact files response structure:", {
      isSuccess: response?.IsSuccess,
      totalItems: response?.TotalItems,
      pageNumber: response?.PageNumber,
      pagesTotal: response?.PagesTotal,
      dataLength: response?.Data?.length || 0,
    })

    return response as PageOfBlobInfoDTO
  } catch (error) {
    console.error(`Error fetching files for contact ${params.contactId}:`, error)
    throw error
  }
}

/**
 * Fetch all files for a contact across all pages
 */
export async function fetchAllContactFiles(params: {
  contactId: string
  dlFileType: string
  maxPages?: number
}) {
  try {
    const allFiles: BlobInfoDTO[] = []
    let currentPage = 1
    const maxPages = params.maxPages || 10
    const pageSize = 50

    while (currentPage <= maxPages) {
      const response = await fetchContactFiles({
        contactId: params.contactId,
        dlFileType: params.dlFileType,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      if (!response.IsSuccess) {
        console.error("Error in file pagination:", response.ErrorMessage)
        break
      }

      allFiles.push(...response.Data)

      if (currentPage >= response.PagesTotal || response.Data.length === 0) {
        break
      }

      currentPage++
    }

    return {
      files: allFiles,
      totalFetched: allFiles.length,
      pagesFetched: currentPage - 1,
    }
  } catch (error) {
    console.error("Error fetching all contact files:", error)
    throw error
  }
}

/**
 * Fetch files associated with a specific policy ID
 */
export async function fetchPolicyFiles(params: {
  contactId: string
  policyId: string
  dlFileType: string
  pageNumber?: number
  pageSize?: number
}) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("contactid", params.contactId)
    queryParams.append("policyid", params.policyId)
    queryParams.append("dlFileType", params.dlFileType)
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 20).toString())

    const endpoint = `Files/FilesByPolicy?${queryParams.toString()}`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Policy files response structure:", {
      isSuccess: response?.IsSuccess,
      totalItems: response?.TotalItems,
      pageNumber: response?.PageNumber,
      pagesTotal: response?.PagesTotal,
      dataLength: response?.Data?.length || 0,
    })

    return response as PageOfBlobInfoDTO
  } catch (error) {
    console.error(`Error fetching files for policy ${params.policyId}:`, error)
    throw error
  }
}

/**
 * Fetch all files for a policy across all pages
 */
export async function fetchAllPolicyFiles(params: {
  contactId: string
  policyId: string
  dlFileType: string
  maxPages?: number
}) {
  try {
    const allFiles: BlobInfoDTO[] = []
    let currentPage = 1
    const maxPages = params.maxPages || 10
    const pageSize = 50

    while (currentPage <= maxPages) {
      const response = await fetchPolicyFiles({
        contactId: params.contactId,
        policyId: params.policyId,
        dlFileType: params.dlFileType,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      if (!response.IsSuccess) {
        console.error("Error in policy file pagination:", response.ErrorMessage)
        break
      }

      allFiles.push(...response.Data)

      if (currentPage >= response.PagesTotal || response.Data.length === 0) {
        break
      }

      currentPage++
    }

    return {
      files: allFiles,
      totalFetched: allFiles.length,
      pagesFetched: currentPage - 1,
    }
  } catch (error) {
    console.error("Error fetching all policy files:", error)
    throw error
  }
}

/**
 * Download a specific file by its blob URL
 */
export async function downloadFile(blobUrl: string, fileName: string) {
  try {
    const response = await fetch(blobUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error(`Error downloading file ${fileName}:`, error)
    throw error
  }
}

/**
 * Fetch account information for a contact including Agent and CSR
 */
export async function fetchContactAccountInfo(contactId: string | number) {
  try {
    const endpoint = `Contacts/${contactId}/AccountInfo`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Contact account info response structure:", {
      hasCustomerID: !!response?.CustomerID,
      hasAgent: !!response?.Agent,
      hasCSR: !!response?.CSR,
      keys: Object.keys(response || {}),
    })

    return response as ContactAccountInfoDTO
  } catch (error) {
    console.error(`Error fetching account info for contact ${contactId}:`, error)
    throw error
  }
}

/**
 * Fetch detailed customer summary information
 */
export async function fetchCustomerDetailSummary(customerId: string | number) {
  try {
    const endpoint = `Customers/${customerId}/CustomerDetailSummary`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Customer detail summary response:", {
      hasEntityID: !!response?.EntityID,
      hasDisplayName: !!response?.DisplayName,
      keys: Object.keys(response || {}),
    })

    return response as CustomerDetailSummaryDTO
  } catch (error) {
    console.error(`Error fetching customer detail summary for ${customerId}:`, error)
    throw error
  }
}
