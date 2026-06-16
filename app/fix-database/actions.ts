"use server"

import { createClient } from "@/lib/supabase/server"

export async function executeFixDatabaseSchema() {
  try {
    const supabase = await createClient()

    const sql = `
-- Complete Production Database Fix
-- Drop incomplete tables and recreate with full schema
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS renewals CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS incoming_calls CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Complete Clients Table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  client_number TEXT,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT,
  fax TEXT,
  website TEXT,
  preferred_contact_method TEXT,
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  client_type TEXT,
  industry TEXT,
  status TEXT,
  total_premium NUMERIC,
  annual_premium NUMERIC,
  account_manager TEXT,
  assigned_agent TEXT,
  referral_source TEXT,
  policy_count INTEGER,
  renewal_date TIMESTAMP,
  qq_contact_id TEXT UNIQUE,
  customer_id TEXT,
  contact_type TEXT,
  location_id TEXT,
  entity_id UUID,
  notes TEXT,
  tags TEXT,
  json_raw JSONB,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on qq_contact_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_qq_contact_id ON clients(qq_contact_id);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP,
  assigned_to TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Renewals Table
CREATE TABLE renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT,
  policy_number TEXT,
  client_name TEXT,
  insured_name TEXT,
  policy_type TEXT,
  expiration_date TIMESTAMP,
  effective_date TIMESTAMP,
  status TEXT DEFAULT 'pending',
  policy_premium NUMERIC,
  insurance_carrier TEXT,
  producer TEXT,
  notes TEXT,
  json_raw JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'pending',
  json_raw JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Incoming Calls Table
CREATE TABLE incoming_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_name TEXT,
  phone_number TEXT,
  call_type TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads Table  
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  qq_contact_id TEXT,
  json_raw JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Policies Table
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT,
  policy_number TEXT,
  line_of_business TEXT,
  policy_type TEXT,
  status TEXT DEFAULT 'active',
  effective_date TIMESTAMP,
  expiration_date TIMESTAMP,
  json_raw JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- QQCatalyst Tokens Table
CREATE TABLE IF NOT EXISTS qqcatalyst_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_in INTEGER,
  expires_at TIMESTAMP,
  client_id TEXT,
  client_secret TEXT,
  username TEXT,
  password TEXT,
  grant_type TEXT NOT NULL DEFAULT 'password',
  scope TEXT,
  access_token_url TEXT NOT NULL,
  client_authentication TEXT NOT NULL DEFAULT 'header',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
`

    // Execute the SQL using Supabase's raw query method
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Fallback: try to execute via REST API or return instructions
      return {
        success: false,
        error: "Unable to execute SQL directly. Please run this SQL in your database console:",
        details: sql
      }
    }

    return {
      success: true,
      message: "Database schema fixed successfully!"
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
      details: error.toString()
    }
  }
}
