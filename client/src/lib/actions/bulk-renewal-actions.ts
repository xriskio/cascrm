import { renewalsApi } from '@/lib/api-client'

export const bulkDeleteRenewals = (ids: string[]) => renewalsApi.bulkDelete(ids)
export const bulkUpdateStatus = async (ids: string[], status: string) => {
  await Promise.all(ids.map(id => renewalsApi.updateStatus(id, status)))
  return { success: true }
}
