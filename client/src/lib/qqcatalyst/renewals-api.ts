import { qqcatalystRequest } from "./client"

export interface QQRenewalPolicy {
  PolicyID: string
  PolicyNumber: string
  ContactID: string
  LineOfBusiness: string
  PolicyType: string
  EffectiveDate: string
  ExpirationDate: string
  Premium: number
  CarrierName: string
  CarrierID: string
  AgentID: string
  AgentName: string
  CSRID: string
  CSRName: string
  InsuredName: string
  BusinessName?: string
  RiskState: string
  RiskCity: string
  RiskZip: string
  Status: string
  LastModified: string
}

export interface QQContact {
  ContactID: string
  EntityID: string
  CustomerNumber: string
  FirstName: string
  LastName: string
  MiddleName?: string
  BusinessName?: string
  Email: string
  Phone: string
  MobilePhone?: string
  WorkPhone?: string
  AddressLine1: string
  AddressLine2?: string
  City: string
  State: string
  ZipCode: string
  DateOfBirth?: string
  SSN?: string
  DriversLicenseNumber?: string
  MaritalStatus?: string
  Gender?: string
  FederalTaxID?: string
  CustomerSince: string
  CustomerStatus: string
  AgentID: string
  AgentName: string
  CSRID: string
  CSRName: string
  PreferredLanguage?: string
}

/**
 * Fetch policies expiring in a specific date range for renewals
 */
export async function fetchRenewalPolicies(params: {
  startDate: string // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
  pageSize?: number
  pageNumber?: number
}) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("startDate", params.startDate)
    queryParams.append("endDate", params.endDate)
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 100).toString())

    const endpoint = `Policies/ExpiringPolicies?${queryParams.toString()}`
    const response = await qqcatalystRequest(endpoint, "GET")

    console.log("Renewal policies response:", {
      isSuccess: response?.IsSuccess,
      totalItems: response?.TotalItems,
      dataLength: response?.Data?.length || 0,
    })

    return {
      data: response?.Data || [],
      pageNumber: response?.PageNumber || 1,
      pagesTotal: response?.PagesTotal || 1,
      totalItems: response?.TotalItems || 0,
      isSuccess: response?.IsSuccess || false,
      errorMessage: response?.ErrorMessage,
    }
  } catch (error) {
    console.error("Error fetching renewal policies:", error)
    throw error
  }
}

/**
 * Fetch all renewal policies in date range with pagination
 */
export async function fetchAllRenewalPolicies(params: {
  startDate: string
  endDate: string
  maxPages?: number
}) {
  try {
    const allPolicies: QQRenewalPolicy[] = []
    let currentPage = 1
    const maxPages = params.maxPages || 20
    const pageSize = 100

    while (currentPage <= maxPages) {
      const response = await fetchRenewalPolicies({
        startDate: params.startDate,
        endDate: params.endDate,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      if (!response.isSuccess) {
        console.error("Error in renewal pagination:", response.errorMessage)
        break
      }

      allPolicies.push(...response.data)

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
    console.error("Error fetching all renewal policies:", error)
    throw error
  }
}

/**
 * Fetch contacts/clients with enhanced field support
 */
export async function fetchEnhancedContacts(params: {
  pageSize?: number
  pageNumber?: number
  modifiedSince?: string
}) {
  try {
    const queryParams = new URLSearchParams()

    if (params.modifiedSince) {
      queryParams.append("modifiedSince", params.modifiedSince)
    }
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 100).toString())

    const endpoint = `Contacts/Enhanced?${queryParams.toString()}`
    const response = await qqcatalystRequest(endpoint, "GET")

    return {
      data: response?.Data || response || [],
      pageNumber: response?.PageNumber || 1,
      pagesTotal: response?.PagesTotal || 1,
      totalItems: response?.TotalItems || response?.length || 0,
      isSuccess: response?.IsSuccess !== false,
    }
  } catch (error) {
    console.error("Error fetching enhanced contacts:", error)
    throw error
  }
}

/**
 * Fetch all contacts with enhanced fields
 */
export async function fetchAllEnhancedContacts(params: {
  maxPages?: number
  modifiedSince?: string
}) {
  try {
    const allContacts: QQContact[] = []
    let currentPage = 1
    const maxPages = params.maxPages || 50
    const pageSize = 100

    while (currentPage <= maxPages) {
      const response = await fetchEnhancedContacts({
        pageNumber: currentPage,
        pageSize: pageSize,
        modifiedSince: params.modifiedSince,
      })

      if (!response.isSuccess && response.data.length === 0) {
        console.error("Error in contact pagination")
        break
      }

      allContacts.push(...response.data)

      if (currentPage >= response.pagesTotal || response.data.length === 0) {
        break
      }

      currentPage++
    }

    return {
      contacts: allContacts,
      totalFetched: allContacts.length,
      pagesFetched: currentPage - 1,
    }
  } catch (error) {
    console.error("Error fetching all enhanced contacts:", error)
    throw error
  }
}

/**
 * Get detailed policy information for renewal processing
 */
export async function fetchPolicyDetailsForRenewal(policyId: string) {
  try {
    const endpoint = `Policies/${policyId}/RenewalDetails`
    const response = await qqcatalystRequest(endpoint, "GET")

    return response || null
  } catch (error) {
    console.error(`Error fetching policy details for renewal ${policyId}:`, error)
    throw error
  }
}

/**
 * Get contact details with all available fields
 */
export async function fetchContactDetails(contactId: string) {
  try {
    const endpoint = `Contacts/${contactId}/Details`
    const response = await qqcatalystRequest(endpoint, "GET")

    return response || null
  } catch (error) {
    console.error(`Error fetching contact details ${contactId}:`, error)
    throw error
  }
}
