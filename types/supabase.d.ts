export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      carrier_contacts: {
        Row: {
          id: string
          company_name: string | null
          company_phone: string | null
          underwriter_name: string | null
          underwriter_email: string | null
          underwriter_phone: string | null
          poc_name: string | null
          poc_email: string | null
          poc_phone: string | null
          agent_id: string | null
          rating_portal_url: string | null
          rating_portal_username: string | null
          rating_portal_password: string | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          insurance_carrier: string | null
          agency_contact: string | null
          agency_contact_email: string | null
          producer_code: string | null
          website_link: string | null
          loss_run_request_link: string | null
          website_login: string | null
          agency_user_id: string | null
          password: string | null
          customer_service_phone: string | null
          billing_phone: string | null
          claims_email: string | null
          claims_phone_number: string | null
          agency_contact_name: string | null
          agency_contact_number: string | null
          underwriter_contact: string | null
          underwriter_number: string | null
          insurance_specialties: string[] | null
          notes: string | null
          specialties: string[] | null
          underwriters: Json | null
        }
        Insert: {
          id?: string
          company_name?: string | null
          company_phone?: string | null
          underwriter_name?: string | null
          underwriter_email?: string | null
          underwriter_phone?: string | null
          poc_name?: string | null
          poc_email?: string | null
          poc_phone?: string | null
          agent_id?: string | null
          rating_portal_url?: string | null
          rating_portal_username?: string | null
          rating_portal_password?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          insurance_carrier?: string | null
          agency_contact?: string | null
          agency_contact_email?: string | null
          producer_code?: string | null
          website_link?: string | null
          loss_run_request_link?: string | null
          website_login?: string | null
          agency_user_id?: string | null
          password?: string | null
          customer_service_phone?: string | null
          billing_phone?: string | null
          claims_email?: string | null
          claims_phone_number?: string | null
          agency_contact_name?: string | null
          agency_contact_number?: string | null
          underwriter_contact?: string | null
          underwriter_number?: string | null
          insurance_specialties?: string[] | null
          notes?: string | null
          specialties?: string[] | null
          underwriters?: Json | null
        }
        Update: {
          id?: string
          company_name?: string | null
          company_phone?: string | null
          underwriter_name?: string | null
          underwriter_email?: string | null
          underwriter_phone?: string | null
          poc_name?: string | null
          poc_email?: string | null
          poc_phone?: string | null
          agent_id?: string | null
          rating_portal_url?: string | null
          rating_portal_username?: string | null
          rating_portal_password?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          insurance_carrier?: string | null
          agency_contact?: string | null
          agency_contact_email?: string | null
          producer_code?: string | null
          website_link?: string | null
          loss_run_request_link?: string | null
          website_login?: string | null
          agency_user_id?: string | null
          password?: string | null
          customer_service_phone?: string | null
          billing_phone?: string | null
          claims_email?: string | null
          claims_phone_number?: string | null
          agency_contact_name?: string | null
          agency_contact_number?: string | null
          underwriter_contact?: string | null
          underwriter_number?: string | null
          insurance_specialties?: string[] | null
          notes?: string | null
          specialties?: string[] | null
          underwriters?: Json | null
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
