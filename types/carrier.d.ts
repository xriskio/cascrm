export interface Underwriter {
  name: string
  phone: string
  email: string
  lines_of_business: string[]
}

export interface CarrierContact {
  id: string
  company_name?: string
  company_phone?: string
  insurance_carrier: string
  producer_code?: string
  website_link?: string
  website_login?: string
  agency_user_id?: string
  password?: string
  customer_service_phone?: string
  billing_phone?: string
  agency_contact?: string
  agency_contact_name?: string
  agency_contact_number?: string
  agency_contact_email?: string
  underwriter_contact?: string
  underwriter_number?: string
  underwriter_email?: string
  underwriter_name?: string
  underwriter_phone?: string
  poc_name?: string
  poc_email?: string
  poc_phone?: string
  loss_run_request_link?: string
  claims_email?: string
  claims_phone_number?: string
  specialties?: string[]
  insurance_specialties?: string[]
  notes?: string
  rating_portal_url?: string
  rating_portal_username?: string
  rating_portal_password?: string
  agent_id?: string
  user_id?: string
  underwriters?: Underwriter[]
  created_at?: string
  updated_at?: string
}

export const LINES_OF_BUSINESS = [
  "Business Owner Policies",
  "General Liability",
  "Commercial Auto",
  "Workers Compensation",
  "Excess Liability",
  "Cyber Liability",
  "Professional Liability",
  "Property",
  "NEMT",
  "Public Auto",
  "Garage Keepers",
  "Auto Dealers",
  "Lessors Risk Only",
  "Contractors",
  "Restaurants",
  "Transportation",
]
