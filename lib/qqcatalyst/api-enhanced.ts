import { qqAuth } from "./auth"

/**
 * Direct API call to QQCatalyst using fetch with dynamic token.
 * Tries the stored bearer token first; if it returns 401 (expired),
 * falls back to OAuth using QQ_CLIENT_ID / QQ_CLIENT_SECRET.
 */
async function makeQQCatalystRequest(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.QQCATALYST_API_URL || "https://api.qqcatalyst.com/v1"
  const url = `${baseUrl}/${endpoint}`

  const doRequest = async (token: string) =>
    fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    })

  // 1. Try the static bearer token if set
  const bearerToken = process.env.QQ_BEARER_TOKEN || process.env.QQCATALYST_BEARER_TOKEN
  if (bearerToken) {
    const response = await doRequest(bearerToken)
    if (response.ok) return response.json()
    // If 401, the static token has expired — fall through to OAuth
    if (response.status !== 401) {
      const errorText = await response.text()
      throw new Error(`QQCatalyst API Error: ${response.status} - ${errorText}`)
    }
    console.warn("Static QQCATALYST_BEARER_TOKEN returned 401 — falling back to OAuth")
  }

  // 2. Fall back to OAuth (uses QQ_CLIENT_ID + QQ_CLIENT_SECRET)
  const oauthToken = await qqAuth.getAccessToken()
  const response = await doRequest(oauthToken)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`QQCatalyst API Error: ${response.status} - ${errorText}`)
  }
  return response.json()
}

/**
 * Fetch contacts using the LastModifiedCreated endpoint (2014-2025)
 */
export async function fetchContactsLastModified(
  params: {
    startDate?: string
    endDate?: string
    pageNumber?: number
    pageSize?: number
  } = {},
) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("startDate", params.startDate || "2014-06-01")
    queryParams.append("endDate", params.endDate || "2025-06-07")
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 500).toString())

    const endpoint = `Contacts/LastModifiedCreated?${queryParams.toString()}`
    const response = await makeQQCatalystRequest(endpoint)

    console.log("Contacts LastModified response:", {
      isSuccess: response?.IsSuccess,
      totalItems: response?.TotalItems,
      pageNumber: response?.PageNumber,
      pagesTotal: response?.PagesTotal,
      dataLength: response?.Data?.length || 0,
    })

    return {
      data: response?.Data || [],
      pageNumber: response?.PageNumber || 1,
      pagesTotal: response?.PagesTotal || 1,
      totalItems: response?.TotalItems || 0,
      isSuccess: response?.IsSuccess || false,
      errorCode: response?.ErrorCode,
      errorMessage: response?.ErrorMessage,
    }
  } catch (error) {
    console.error("Error fetching contacts last modified:", error)
    throw error
  }
}

/**
 * Fetch policies using the LastModifiedCreated endpoint (2017-2025)
 */
export async function fetchPoliciesLastModified(
  params: {
    startDate?: string
    endDate?: string
    pageNumber?: number
    pageSize?: number
  } = {},
) {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("startDate", params.startDate || "2017-01-01")
    queryParams.append("endDate", params.endDate || "2025-06-10")
    queryParams.append("pageNumber", (params.pageNumber || 1).toString())
    queryParams.append("pageSize", (params.pageSize || 500).toString())

    const endpoint = `Policies/LastModifiedCreated?${queryParams.toString()}`
    const response = await makeQQCatalystRequest(endpoint)

    console.log("Policies LastModified response:", {
      isSuccess: response?.IsSuccess,
      totalItems: response?.TotalItems,
      pageNumber: response?.PageNumber,
      pagesTotal: response?.PagesTotal,
      dataLength: response?.Data?.length || 0,
    })

    return {
      data: response?.Data || [],
      pageNumber: response?.PageNumber || 1,
      pagesTotal: response?.PagesTotal || 1,
      totalItems: response?.TotalItems || 0,
      isSuccess: response?.IsSuccess || false,
      errorCode: response?.ErrorCode,
      errorMessage: response?.ErrorMessage,
    }
  } catch (error) {
    console.error("Error fetching policies last modified:", error)
    throw error
  }
}

/**
 * Search policies with dates using the advanced search endpoint
 */
export async function searchPoliciesWithDates(
  params: {
    policyNumber?: string
    lobFilterID?: number
    locationFilterID?: number
    effectiveFromDateTime?: string
    effectiveToDateTime?: string
    expiredFromDateTime?: string
    expiredToDateTime?: string
    pageNumber?: number
    pageSize?: number
  } = {},
) {
  try {
    const requestData = {
      PolicyNumber: params.policyNumber || "",
      LOBFilterID: params.lobFilterID || null,
      LocationFilterID: params.locationFilterID || null,
      EffectiveFromDateTime: params.effectiveFromDateTime || "2010-01-01T00:00:00Z",
      EffectiveToDateTime: params.effectiveToDateTime || "2030-12-31T23:59:59Z",
      ExpiredFromDateTime: params.expiredFromDateTime || "2010-01-01T00:00:00Z",
      ExpiredToDateTime: params.expiredToDateTime || "2030-12-31T23:59:59Z",
      PageNumber: params.pageNumber || 1,
      PageSize: params.pageSize || 50,
    }

    const response = await makeQQCatalystRequest("Search/PoliciesWithDates", {
      method: "POST",
      body: JSON.stringify(requestData),
    })

    console.log("Search PoliciesWithDates response:", {
      isSuccess: response?.IsSuccess,
      totalItems: response?.TotalItems,
      pageNumber: response?.PageNumber,
      pagesTotal: response?.PagesTotal,
      dataLength: response?.Data?.length || 0,
    })

    return {
      data: response?.Data || [],
      pageNumber: response?.PageNumber || 1,
      pagesTotal: response?.PagesTotal || 1,
      totalItems: response?.TotalItems || 0,
      isSuccess: response?.IsSuccess || false,
      errorCode: response?.ErrorCode,
      errorMessage: response?.ErrorMessage,
    }
  } catch (error) {
    console.error("Error searching policies with dates:", error)
    throw error
  }
}

/**
 * Fetch all contacts across multiple pages
 */
export async function fetchAllContacts(maxPages = 10) {
  try {
    const allContacts = []
    let currentPage = 1

    while (currentPage <= maxPages) {
      const response = await fetchContactsLastModified({
        pageNumber: currentPage,
        pageSize: 500,
      })

      if (!response.isSuccess) {
        console.error("Error in contacts pagination:", response.errorMessage)
        break
      }

      allContacts.push(...response.data)

      if (currentPage >= response.pagesTotal || response.data.length === 0) {
        break
      }

      currentPage++
    }

    return allContacts
  } catch (error) {
    console.error("Error fetching all contacts:", error)
    throw error
  }
}

/**
 * Fetch all policies across multiple pages
 */
export async function fetchAllPolicies(maxPages = 10) {
  try {
    const allPolicies = []
    let currentPage = 1

    while (currentPage <= maxPages) {
      const response = await fetchPoliciesLastModified({
        pageNumber: currentPage,
        pageSize: 500,
      })

      if (!response.isSuccess) {
        console.error("Error in policies pagination:", response.errorMessage)
        break
      }

      allPolicies.push(...response.data)

      if (currentPage >= response.pagesTotal || response.data.length === 0) {
        break
      }

      currentPage++
    }

    return allPolicies
  } catch (error) {
    console.error("Error fetching all policies:", error)
    throw error
  }
}

/**
 * Fetch renewals (policies expiring in the next 90 days)
 */
export async function fetchRenewals() {
  try {
    const today = new Date()
    const threeMonthsFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

    const response = await searchPoliciesWithDates({
      expiredFromDateTime: today.toISOString(),
      expiredToDateTime: threeMonthsFromNow.toISOString(),
      pageSize: 500,
    })

    return response
  } catch (error) {
    console.error("Error fetching renewals:", error)
    throw error
  }
}

/**
 * Test API connection
 */
export async function testQQCatalystConnection() {
  try {
    const response = await fetchContactsLastModified({
      pageNumber: 1,
      pageSize: 1,
    })
    return { success: true, data: response }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ─── Additional endpoints from QQCatalyst API docs ───────────────────────────
export const getContactSummary=(id:string|number)=>makeQQCatalystRequest("Contacts/"+id+"/ContactSummaryDTO")
export const getContactAccountInfo=(id:string|number)=>makeQQCatalystRequest("Contacts/"+id+"/AccountInfo")
export const getContactAddresses=(id:string|number)=>makeQQCatalystRequest("Contacts/"+id+"/Addresses")
export const getContactPhoneNumbers=(id:string|number)=>makeQQCatalystRequest("Contacts/"+id+"/PhoneNumbers")
export const getContactEmails=(id:string|number)=>makeQQCatalystRequest("Contacts/"+id+"/Emails")
export const getContactNotes=(id:string|number,page=1,size=50)=>makeQQCatalystRequest("Contacts/"+id+"/Notes?pageNumber="+page+"&pageSize="+size)
export const getContactTasks=(id:string|number,page=1,size=50)=>makeQQCatalystRequest("Contacts/"+id+"/Tasks?pageNumber="+page+"&pageSize="+size)
export const getPoliciesByCustomer=(cid:string|number,page=1,rows=100)=>makeQQCatalystRequest("Policies/ByCustomer/"+cid+"?page="+page+"&rowCount="+rows)
export const getPolicyInfo=(id:string|number)=>makeQQCatalystRequest("Policies/"+id+"/PolicyInfo")
export const getPolicyLines=(id:string|number)=>makeQQCatalystRequest("Policies/"+id+"/PolicyLines")
export const getPolicyNotes=(id:string|number,p=1,s=50)=>makeQQCatalystRequest("Policies/"+id+"/Notes?pageNumber="+p+"&pageSize="+s)
export const getPolicyQuotes=(id:string|number)=>makeQQCatalystRequest("Policies/"+id+"/Quotes")
export const getPolicySummary=(id:string|number)=>makeQQCatalystRequest("PolicySummaryForApi?policyID="+id)
export const getPolicyPremium=(id:string|number)=>makeQQCatalystRequest("Policies/"+id+"/Premium")
export const getCarriers=()=>makeQQCatalystRequest("Carriers")
export const getUserLocations=()=>makeQQCatalystRequest("Locations/UserLocationsV2")
export const getFilesByContact=(cid:string|number,p=1,s=50)=>makeQQCatalystRequest("Files/FilesByContact?contactid="+cid+"&pageNumber="+p+"&pageSize="+s)
export const getFilesByPolicy=(cid:string|number,pid:string|number)=>makeQQCatalystRequest("Files/FilesByPolicy?contactid="+cid+"&policyid="+pid)
export const quickSearch=(s:string)=>makeQQCatalystRequest("Search?searchString="+encodeURIComponent(s))
export async function ping(){try{const r=await makeQQCatalystRequest("BusinessLogic/Ping");return{ok:true,response:r}}catch(e:any){return{ok:false,error:e.message}}}