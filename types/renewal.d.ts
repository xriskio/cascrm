export interface Renewal {
  id?: number
  date_entered: string // ISO date string
  insured_name: string
  retail_agency_name?: string
  producer?: string
  policy_type?: string
  policy_number?: string
  effective_date?: string
  expiration_date: string
  insurance_carrier: string
  expiring_premium?: number
  expiring_commission?: number
  wholesaler_mga?: string
  renewal_premium?: number
  renewal_commission?: number
  status: "pending" | "quoted" | "declined" | "non-renewed" | "lost" | "bound"
  last_contact_date?: string
  next_follow_up_date?: string
  date_renewal_sent?: string
  date_quote_received?: string
  date_sent_to_insured?: string
  remarketing_requested?: boolean
  reason_lost?: string
  notes?: string
  task?: string
  documents?: string // URL or file path
}
