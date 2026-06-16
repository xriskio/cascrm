-- =====================================================
-- RENEWALS IMPORT DATABASE SETUP
-- Run this in Supabase SQL Editor to create all necessary tables
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- Copy this SQL and click "Run"
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (Required for authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. RENEWALS TABLE (Main table for import)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.renewals (
  id SERIAL PRIMARY KEY,
  renewal_number VARCHAR(255) UNIQUE NOT NULL,
  renewal_id TEXT UNIQUE NOT NULL,
  insured_name TEXT NOT NULL,
  retail_agency_name TEXT,
  producer TEXT,
  policy_type TEXT,
  policy_number TEXT,
  effective_date DATE,
  expiration_date DATE NOT NULL,
  insurance_carrier TEXT NOT NULL,
  expiring_premium DECIMAL(10,2),
  expiring_commission DECIMAL(10,2),
  wholesaler_mga TEXT,
  renewal_premium DECIMAL(10,2),
  renewal_commission DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  last_contact_date DATE,
  next_follow_up_date DATE,
  date_renewal_sent DATE,
  date_quote_received DATE,
  date_sent_to_insured DATE,
  remarketing_requested BOOLEAN DEFAULT FALSE,
  reason_lost TEXT,
  notes TEXT,
  task TEXT,
  documents TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_renewals_status ON public.renewals(status);
CREATE INDEX IF NOT EXISTS idx_renewals_expiration_date ON public.renewals(expiration_date);
CREATE INDEX IF NOT EXISTS idx_renewals_policy_number ON public.renewals(policy_number);
CREATE INDEX IF NOT EXISTS idx_renewals_renewal_number ON public.renewals(renewal_number);

-- =====================================================
-- 3. DISABLE ROW LEVEL SECURITY (RLS)
-- This allows the app to access data without complex policies
-- Enable RLS later for production security
-- =====================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- Allow authenticated users to access the tables
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database setup complete! You can now import renewals.' as message;
