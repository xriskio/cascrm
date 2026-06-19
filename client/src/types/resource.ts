export interface AgencyResource {
  id: string
  title: string
  description?: string
  category?: string
  file_url?: string
  external_url?: string
  file_type?: string
  resource_type?: string
  created_at?: string
  updated_at?: string
}

export const RESOURCE_CATEGORIES = [
  "Forms",
  "Procedures",
  "Regulations",
  "Training",
  "Marketing",
  "Carrier Information",
  "Reference",
  "Other",
]
