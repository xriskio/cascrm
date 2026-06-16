export interface WorkflowItem {
  id: string
  type: 'renewal' | 'submission'
  clientName: string
  policyNumber?: string
  trackingNumber?: string
  status: string
  policyType: string
  carrier?: string
  premium: number
  quotedPremium?: number
  expiryDate?: string
  daysUntilExpiry?: number
  createdAt: string
  updatedAt: string
  assignedAgent?: string
}
