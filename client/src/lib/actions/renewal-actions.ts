import { renewalsApi } from '@/lib/api-client'

export const getRenewalStatusHistory = (id: string) => renewalsApi.getStatusHistory(id)
export const updateRenewalStatus = (id: string, status: string, notes?: string) => renewalsApi.updateStatus(id, status, notes)
export const updateRemarketingCompanies = (id: string, companies: any[]) => renewalsApi.updateRemarketing(id, companies)

export const getRenewals = (params?: any) => {
  const { renewalsApi } = require('@/lib/api-client')
  return renewalsApi.list(params)
}
export const removeDuplicateRenewals = () => fetch('/api/renewals/remove-duplicates', { method: 'POST' }).then(r => r.json())
export const bulkDeleteRenewals = (ids: string[]) => fetch('/api/renewals/bulk-delete', { method: 'POST', body: JSON.stringify({ renewalIds: ids }), headers: { 'Content-Type': 'application/json' } }).then(r => r.json())
export const bulkUpdateRenewalStatus = (ids: string[], status: string) => Promise.all(ids.map(id => fetch(`/api/renewals/${id}`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } }).then(r => r.json())))
export const bulkArchiveRenewals = (ids: string[]) => bulkUpdateRenewalStatus(ids, 'archived')
export const archiveRenewal = (id: string) => fetch(`/api/renewals/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }), headers: { 'Content-Type': 'application/json' } }).then(r => r.json())
export const deleteRenewal = (id: string) => fetch(`/api/renewals/${id}`, { method: 'DELETE' }).then(r => r.json())
export const getRenewal = (id: string) => fetch(`/api/renewals/${id}`).then(r => r.json())
