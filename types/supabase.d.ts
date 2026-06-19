export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      carrier_contacts: {
        Row: {
          agency_contact: string | null
          agency_contact_email: string | null
          agency_contact_name: string | null
          agency_contact_number: string | null
          agency_user_id: string | null
          agent_id: string | null
          billing_phone: string | null
          claims_email: string | null
          claims_phone_number: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string | null
          customer_service_phone: string | null
          id: number
          insurance_carrier: string
          insurance_specialties: string[] | null
          loss_run_request_link: string | null
          notes: string | null
          password: string | null
          poc_email: string | null
          poc_name: string | null
          poc_phone: string | null
          producer_code: string | null
          rating_portal_password: string | null
          rating_portal_url: string | null
          rating_portal_username: string | null
          specialties: string[] | null
          underwriter_contact: string | null
          underwriter_email: string | null
          underwriter_name: string | null
          underwriter_number: string | null
          underwriter_phone: string | null
          underwriters: Json | null
          updated_at: string | null
          user_id: string | null
          website_link: string | null
          website_login: string | null
        }
        Insert: {
          agency_contact?: string | null
          agency_contact_email?: string | null
          agency_contact_name?: string | null
          agency_contact_number?: string | null
          agency_user_id?: string | null
          agent_id?: string | null
          billing_phone?: string | null
          claims_email?: string | null
          claims_phone_number?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          customer_service_phone?: string | null
          id?: number
          insurance_carrier: string
          insurance_specialties?: string[] | null
          loss_run_request_link?: string | null
          notes?: string | null
          password?: string | null
          poc_email?: string | null
          poc_name?: string | null
          poc_phone?: string | null
          producer_code?: string | null
          rating_portal_password?: string | null
          rating_portal_url?: string | null
          rating_portal_username?: string | null
          specialties?: string[] | null
          underwriter_contact?: string | null
          underwriter_email?: string | null
          underwriter_name?: string | null
          underwriter_number?: string | null
          underwriter_phone?: string | null
          underwriters?: Json | null
          updated_at?: string | null
          user_id?: string | null
          website_link?: string | null
          website_login?: string | null
        }
        Update: {
          agency_contact?: string | null
          agency_contact_email?: string | null
          agency_contact_name?: string | null
          agency_contact_number?: string | null
          agency_user_id?: string | null
          agent_id?: string | null
          billing_phone?: string | null
          claims_email?: string | null
          claims_phone_number?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          customer_service_phone?: string | null
          id?: number
          insurance_carrier?: string
          insurance_specialties?: string[] | null
          loss_run_request_link?: string | null
          notes?: string | null
          password?: string | null
          poc_email?: string | null
          poc_name?: string | null
          poc_phone?: string | null
          producer_code?: string | null
          rating_portal_password?: string | null
          rating_portal_url?: string | null
          rating_portal_username?: string | null
          specialties?: string[] | null
          underwriter_contact?: string | null
          underwriter_email?: string | null
          underwriter_name?: string | null
          underwriter_number?: string | null
          underwriter_phone?: string | null
          underwriters?: Json | null
          updated_at?: string | null
          user_id?: string | null
          website_link?: string | null
          website_login?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          business_name: string | null
          city: string | null
          contact_name: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          entity_id: string | null
          first_name: string | null
          id: string
          json_raw: Json | null
          last_name: string | null
          name: string | null
          phone: string | null
          policy_count: number | null
          qq_contact_id: string
          renewal_date: string | null
          state: string | null
          status: string | null
          total_premium: number | null
          updated_at: string
          zip: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          contact_name?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          entity_id?: string | null
          first_name?: string | null
          id?: string
          json_raw?: Json | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          policy_count?: number | null
          qq_contact_id: string
          renewal_date?: string | null
          state?: string | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string
          zip?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          contact_name?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          entity_id?: string | null
          first_name?: string | null
          id?: string
          json_raw?: Json | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          policy_count?: number | null
          qq_contact_id?: string
          renewal_date?: string | null
          state?: string | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string
          zip?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_name: string | null
          city: string | null
          client_id: string | null
          contact_number: string
          contact_type: string | null
          country: string | null
          county: string | null
          created_at: string | null
          department: string | null
          email: string | null
          fax: string | null
          first_name: string | null
          full_name: string | null
          id: string
          json_raw: Json | null
          last_name: string | null
          location_id: string | null
          mobile: string | null
          phone: string | null
          qq_contact_id: string | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          client_id?: string | null
          contact_number: string
          contact_type?: string | null
          country?: string | null
          county?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          fax?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          json_raw?: Json | null
          last_name?: string | null
          location_id?: string | null
          mobile?: string | null
          phone?: string | null
          qq_contact_id?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          client_id?: string | null
          contact_number?: string
          contact_type?: string | null
          country?: string | null
          county?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          fax?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          json_raw?: Json | null
          last_name?: string | null
          location_id?: string | null
          mobile?: string | null
          phone?: string | null
          qq_contact_id?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requests: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          client_email: string | null
          client_id: number | null
          client_name: string | null
          created_at: string
          description: string | null
          document_type: string | null
          due_date: string | null
          id: string
          json_raw: Json | null
          notes: string | null
          priority: string | null
          received_date: string | null
          requested_date: string | null
          status: string | null
          tracking_number: string
          updated_at: string
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          client_email?: string | null
          client_id?: number | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          document_type?: string | null
          due_date?: string | null
          id?: string
          json_raw?: Json | null
          notes?: string | null
          priority?: string | null
          received_date?: string | null
          requested_date?: string | null
          status?: string | null
          tracking_number: string
          updated_at?: string
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          client_email?: string | null
          client_id?: number | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          document_type?: string | null
          due_date?: string | null
          id?: string
          json_raw?: Json | null
          notes?: string | null
          priority?: string | null
          received_date?: string | null
          requested_date?: string | null
          status?: string | null
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      incoming_calls: {
        Row: {
          call_back_date: string | null
          call_back_time: string | null
          call_date: string | null
          call_number: string | null
          call_time: string | null
          category: string
          company_name: string | null
          contact_name: string
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          named_insured: string | null
          notes: string | null
          phone: string
          reason: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          call_back_date?: string | null
          call_back_time?: string | null
          call_date?: string | null
          call_number?: string | null
          call_time?: string | null
          category: string
          company_name?: string | null
          contact_name: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          named_insured?: string | null
          notes?: string | null
          phone: string
          reason?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          call_back_date?: string | null
          call_back_time?: string | null
          call_date?: string | null
          call_number?: string | null
          call_time?: string | null
          category?: string
          company_name?: string | null
          contact_name?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          named_insured?: string | null
          notes?: string | null
          phone?: string
          reason?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      inspections: {
        Row: {
          client_id: number | null
          client_name: string | null
          completed_date: string | null
          created_at: string
          findings: string | null
          id: string
          inspection_type: string | null
          inspector_company: string | null
          inspector_name: string | null
          json_raw: Json | null
          notes: string | null
          property_address: string | null
          result: string | null
          scheduled_date: string | null
          status: string | null
          tracking_number: string
          updated_at: string
        }
        Insert: {
          client_id?: number | null
          client_name?: string | null
          completed_date?: string | null
          created_at?: string
          findings?: string | null
          id?: string
          inspection_type?: string | null
          inspector_company?: string | null
          inspector_name?: string | null
          json_raw?: Json | null
          notes?: string | null
          property_address?: string | null
          result?: string | null
          scheduled_date?: string | null
          status?: string | null
          tracking_number: string
          updated_at?: string
        }
        Update: {
          client_id?: number | null
          client_name?: string | null
          completed_date?: string | null
          created_at?: string
          findings?: string | null
          id?: string
          inspection_type?: string | null
          inspector_company?: string | null
          inspector_name?: string | null
          json_raw?: Json | null
          notes?: string | null
          property_address?: string | null
          result?: string | null
          scheduled_date?: string | null
          status?: string | null
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_comments: {
        Row: {
          author: string | null
          comment: string
          created_at: string | null
          id: number
          lead_id: number | null
        }
        Insert: {
          author?: string | null
          comment: string
          created_at?: string | null
          id?: number
          lead_id?: number | null
        }
        Update: {
          author?: string | null
          comment?: string
          created_at?: string | null
          id?: number
          lead_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_comments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          date_entered: string | null
          email: string | null
          id: number
          lead_id: string | null
          name: string
          notes: string | null
          phone: string | null
          priority: string | null
          product_interest: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          date_entered?: string | null
          email?: string | null
          id?: number
          lead_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          priority?: string | null
          product_interest?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          date_entered?: string | null
          email?: string | null
          id?: number
          lead_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: string | null
          product_interest?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_submissions: {
        Row: {
          carrier_name: string | null
          client_name: string | null
          coverage_details: string | null
          created_at: string
          decline_reason: string | null
          id: string
          json_raw: Json | null
          market_name: string | null
          notes: string | null
          policy_type: string | null
          premium_quoted: string | null
          priority: string | null
          quote_amount: number | null
          quote_status: string | null
          response_date: string | null
          status: string | null
          submission_date: string | null
          submission_id: string | null
          submission_tracking: string | null
          tracking_number: string | null
          updated_at: string
          wholesaler_company: string | null
          wholesaler_email: string | null
          wholesaler_name: string | null
          wholesaler_phone: string | null
        }
        Insert: {
          carrier_name?: string | null
          client_name?: string | null
          coverage_details?: string | null
          created_at?: string
          decline_reason?: string | null
          id?: string
          json_raw?: Json | null
          market_name?: string | null
          notes?: string | null
          policy_type?: string | null
          premium_quoted?: string | null
          priority?: string | null
          quote_amount?: number | null
          quote_status?: string | null
          response_date?: string | null
          status?: string | null
          submission_date?: string | null
          submission_id?: string | null
          submission_tracking?: string | null
          tracking_number?: string | null
          updated_at?: string
          wholesaler_company?: string | null
          wholesaler_email?: string | null
          wholesaler_name?: string | null
          wholesaler_phone?: string | null
        }
        Update: {
          carrier_name?: string | null
          client_name?: string | null
          coverage_details?: string | null
          created_at?: string
          decline_reason?: string | null
          id?: string
          json_raw?: Json | null
          market_name?: string | null
          notes?: string | null
          policy_type?: string | null
          premium_quoted?: string | null
          priority?: string | null
          quote_amount?: number | null
          quote_status?: string | null
          response_date?: string | null
          status?: string | null
          submission_date?: string | null
          submission_id?: string | null
          submission_tracking?: string | null
          tracking_number?: string | null
          updated_at?: string
          wholesaler_company?: string | null
          wholesaler_email?: string | null
          wholesaler_name?: string | null
          wholesaler_phone?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          agent_name: string | null
          carrier: string | null
          client_id: number | null
          created_at: string
          customer_id: string | null
          description: string | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          insurance_company: string | null
          json_raw: Json | null
          lob: string | null
          mga: string | null
          named_insured: string | null
          policy_number: string | null
          policy_type: string | null
          premium: number | null
          qq_policy_id: string | null
          status: string | null
          total_premium: number | null
          updated_at: string
          writing_carrier: string | null
        }
        Insert: {
          agent_name?: string | null
          carrier?: string | null
          client_id?: number | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          insurance_company?: string | null
          json_raw?: Json | null
          lob?: string | null
          mga?: string | null
          named_insured?: string | null
          policy_number?: string | null
          policy_type?: string | null
          premium?: number | null
          qq_policy_id?: string | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string
          writing_carrier?: string | null
        }
        Update: {
          agent_name?: string | null
          carrier?: string | null
          client_id?: number | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          insurance_company?: string | null
          json_raw?: Json | null
          lob?: string | null
          mga?: string | null
          named_insured?: string | null
          policy_number?: string | null
          policy_type?: string | null
          premium?: number | null
          qq_policy_id?: string | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string
          writing_carrier?: string | null
        }
        Relationships: []
      }
      qqcatalyst_policies: {
        Row: {
          agent_name: string | null
          carrier_name: string | null
          created_at: string | null
          customer_id: number | null
          customer_name: string | null
          description: string | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          lob_name: string | null
          policy_id: number
          policy_number: string | null
          raw_data: Json | null
          status: string | null
          total_premium: number | null
          updated_at: string | null
        }
        Insert: {
          agent_name?: string | null
          carrier_name?: string | null
          created_at?: string | null
          customer_id?: number | null
          customer_name?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          lob_name?: string | null
          policy_id: number
          policy_number?: string | null
          raw_data?: Json | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string | null
          carrier_name?: string | null
          created_at?: string | null
          customer_id?: number | null
          customer_name?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          lob_name?: string | null
          policy_id?: number
          policy_number?: string | null
          raw_data?: Json | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qqcatalyst_tokens: {
        Row: {
          access_token: string
          access_token_url: string | null
          client_authentication: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          expires_in: number | null
          grant_type: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          password: string | null
          refresh_token: string | null
          scope: string | null
          token_name: string
          token_type: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          access_token: string
          access_token_url?: string | null
          client_authentication?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          expires_in?: number | null
          grant_type?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          password?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_name: string
          token_type?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          access_token?: string
          access_token_url?: string | null
          client_authentication?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          expires_in?: number | null
          grant_type?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          password?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_name?: string
          token_type?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      renewals: {
        Row: {
          agent_name: string | null
          archived: boolean | null
          carrier: string | null
          client_name: string | null
          contact_id: number | null
          created_at: string
          description: string | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          insurance_company: string | null
          json_raw: Json | null
          lob: string | null
          mga: string | null
          named_insured: string | null
          notes: string | null
          policy_number: string | null
          policy_type: string | null
          premium: number | null
          qq_policy_id: string | null
          renewal_date: string | null
          status: string | null
          total_premium: number | null
          updated_at: string
        }
        Insert: {
          agent_name?: string | null
          archived?: boolean | null
          carrier?: string | null
          client_name?: string | null
          contact_id?: number | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          insurance_company?: string | null
          json_raw?: Json | null
          lob?: string | null
          mga?: string | null
          named_insured?: string | null
          notes?: string | null
          policy_number?: string | null
          policy_type?: string | null
          premium?: number | null
          qq_policy_id?: string | null
          renewal_date?: string | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string
        }
        Update: {
          agent_name?: string | null
          archived?: boolean | null
          carrier?: string | null
          client_name?: string | null
          contact_id?: number | null
          created_at?: string
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          insurance_company?: string | null
          json_raw?: Json | null
          lob?: string | null
          mga?: string | null
          named_insured?: string | null
          notes?: string | null
          policy_number?: string | null
          policy_type?: string | null
          premium?: number | null
          qq_policy_id?: string | null
          renewal_date?: string | null
          status?: string | null
          total_premium?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          client_name: string
          created_at: string | null
          description: string
          effective_date: string
          id: number
          policy_number: string
          specific_data: Json | null
          status: string
          type: string
          updated_at: string | null
          urgency: string
        }
        Insert: {
          client_name: string
          created_at?: string | null
          description: string
          effective_date: string
          id?: number
          policy_number: string
          specific_data?: Json | null
          status?: string
          type: string
          updated_at?: string | null
          urgency: string
        }
        Update: {
          client_name?: string
          created_at?: string | null
          description?: string
          effective_date?: string
          id?: number
          policy_number?: string
          specific_data?: Json | null
          status?: string
          type?: string
          updated_at?: string | null
          urgency?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assigned_agent: string | null
          carrier: string | null
          client_id: number | null
          client_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          date_received: string | null
          description: string | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          json_raw: Json | null
          notes: string | null
          policy_type: string | null
          premium_amount: string | null
          priority: string | null
          quoted_premium: number | null
          requested_premium: number | null
          status: string | null
          time_received: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          carrier?: string | null
          client_id?: number | null
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_received?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          json_raw?: Json | null
          notes?: string | null
          policy_type?: string | null
          premium_amount?: string | null
          priority?: string | null
          quoted_premium?: number | null
          requested_premium?: number | null
          status?: string | null
          time_received?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          carrier?: string | null
          client_id?: number | null
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_received?: string | null
          description?: string | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          json_raw?: Json | null
          notes?: string | null
          policy_type?: string | null
          premium_amount?: string | null
          priority?: string | null
          quoted_premium?: number | null
          requested_premium?: number | null
          status?: string | null
          time_received?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          client_id: string | null
          completion_percentage: number
          created_at: string | null
          creator_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          supervisor_id: string | null
          task_number: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          client_id?: string | null
          completion_percentage?: number
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          supervisor_id?: string | null
          task_number?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          client_id?: string | null
          completion_percentage?: number
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          supervisor_id?: string | null
          task_number?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

