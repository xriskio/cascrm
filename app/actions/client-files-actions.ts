"use server"

import { fetchContactFiles, fetchAllContactFiles, fetchPolicyFiles, fetchAllPolicyFiles } from "@/lib/qqcatalyst/api"
import { revalidatePath } from "next/cache"
import type { PageOfBlobInfoDTO, FetchFilesParams } from "@/types/qqcatalyst-files"

export async function getClientFiles(params: FetchFilesParams): Promise<PageOfBlobInfoDTO> {
  try {
    const response = await fetchContactFiles({
      contactId: params.contactId,
      dlFileType: params.dlFileType,
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 20,
    })

    return response
  } catch (error) {
    console.error("Error fetching client files:", error)
    throw new Error("Failed to fetch client files")
  }
}

export async function getAllClientFiles(params: {
  contactId: string
  dlFileType: string
  maxPages?: number
}) {
  try {
    const response = await fetchAllContactFiles({
      contactId: params.contactId,
      dlFileType: params.dlFileType,
      maxPages: params.maxPages || 5,
    })

    return response
  } catch (error) {
    console.error("Error fetching all client files:", error)
    throw new Error("Failed to fetch all client files")
  }
}

export async function refreshClientFiles(clientId: string) {
  try {
    revalidatePath(`/clients/${clientId}`)
    revalidatePath(`/clients/${clientId}/documents`)
    return { success: true }
  } catch (error) {
    console.error("Error refreshing client files:", error)
    throw new Error("Failed to refresh client files")
  }
}

export async function getPolicyFiles(params: {
  contactId: string
  policyId: string
  dlFileType: string
  pageNumber?: number
  pageSize?: number
}): Promise<PageOfBlobInfoDTO> {
  try {
    const response = await fetchPolicyFiles({
      contactId: params.contactId,
      policyId: params.policyId,
      dlFileType: params.dlFileType,
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 20,
    })

    return response
  } catch (error) {
    console.error("Error fetching policy files:", error)
    throw new Error("Failed to fetch policy files")
  }
}

export async function getAllPolicyFiles(params: {
  contactId: string
  policyId: string
  dlFileType: string
  maxPages?: number
}) {
  try {
    const response = await fetchAllPolicyFiles({
      contactId: params.contactId,
      policyId: params.policyId,
      dlFileType: params.dlFileType,
      maxPages: params.maxPages || 5,
    })

    return response
  } catch (error) {
    console.error("Error fetching all policy files:", error)
    throw new Error("Failed to fetch all policy files")
  }
}
