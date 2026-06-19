export interface Underwriter {
  name: string
  phone?: string
  email?: string
  lines_of_business?: string[]
}

export interface CarrierContact {
  id: string
  insurance_carrier: string
  producer_code?: string
  website_link?: string
  loss_run_request_link?: string
  website_login?: string
  agency_user_id?: string
  password?: string
  customer_service_phone?: string
  billing_phone?: string
  agency_contact?: string
  agency_contact_name?: string
  agency_contact_number?: string
  agency_contact_email?: string
  claims_email?: string
  claims_phone_number?: string
  underwriter_contact?: string
  underwriter_number?: string
  underwriter_email?: string
  underwriter_name?: string
  underwriter_phone?: string
  specialties?: string[]
  insurance_specialties?: string[]
  notes?: string
  created_at?: string
  updated_at?: string
  underwriters?: Underwriter[]
}

// For backward compatibility
export interface Carrier {
  id: string
  name: string
  contact_name?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

// Lines of business for underwriters
export const LINES_OF_BUSINESS = [
  "BUSINESS OWNER POLICIES",
  "GENERAL LIABILITY",
  "COMMERCIAL AUTO",
  "WORKERS COMPENSATION",
  "EXCESS LIABILITY",
  "CYBER LIABILITY",
  "PROFESSIONAL LIABILITY",
  "PROPERTY",
  "GARAGE LIABILITY",
  "GARAGE KEEPERS",
  "INLAND MARINE",
  "UMBRELLA",
]
