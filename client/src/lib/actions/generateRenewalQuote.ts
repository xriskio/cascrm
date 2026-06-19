import { request } from '@/lib/api-client'
// Re-export as default if needed
const req = (path: string, options?: RequestInit) => fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options }).then(r => r.json())
export const generateRenewalQuote = (renewalId: string, data: any) => req('/renewals/generate-quote', { method: 'POST', body: JSON.stringify({ renewalId, ...data }) })
