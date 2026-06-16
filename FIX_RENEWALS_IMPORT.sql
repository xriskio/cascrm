-- ========================================
-- FIX RENEWALS IMPORT - RUN THIS IN SUPABASE SQL EDITOR
-- ========================================
-- This will create/recreate the renewals table with all required columns
-- for QQCatalyst API import
--
-- HOW TO RUN:
-- 1. Go to your Supabase project → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" button
-- ========================================

-- Drop the existing renewals table if it exists
DROP TABLE IF EXISTS renewals CASCADE;

-- Create renewals table with all required columns
CREATE TABLE renewals (
  -- Primary key and identifiers
  id SERIAL PRIMARY KEY,
  renewal_number TEXT UNIQUE NOT NULL,
  
  -- Basic information
  insured_name TEXT NOT NULL,
  retail_agency_name TEXT,
  producer TEXT,
  
  -- Policy details
  policy_type TEXT,
  policy_number TEXT,
  effective_date DATE,
  expiration_date DATE NOT NULL,
  insurance_carrier TEXT NOT NULL,
  
  -- Financial information (CRITICAL FOR QQCATALYST IMPORT)
  expiring_premium DECIMAL(10,2),
  expiring_commission DECIMAL(10,2),
  wholesaler_mga TEXT,
  renewal_premium DECIMAL(10,2),
  renewal_commission DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  commission_percent DECIMAL(5,2),
  fees DECIMAL(10,2),
  
  -- Status and tracking
  status TEXT NOT NULL DEFAULT 'pending',
  last_contact_date DATE,
  next_follow_up_date DATE,
  date_renewal_sent DATE,
  date_quote_received DATE,
  date_sent_to_insured DATE,
  remarketing_requested BOOLEAN DEFAULT FALSE,
  
  -- Additional information
  reason_lost TEXT,
  notes TEXT,
  task TEXT,
  documents TEXT,
  
  -- Client details
  client_email TEXT,
  client_phone TEXT,
  preferred_contact_method TEXT,
  
  -- Policy specifics
  current_limits TEXT,
  current_deductibles TEXT,
  number_of_units INTEGER,
  renewal_offer_notes TEXT,
  
  -- Account management
  account_manager TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_renewals_expiration_date ON renewals(expiration_date);
CREATE INDEX idx_renewals_status ON renewals(status);
CREATE INDEX idx_renewals_insurance_carrier ON renewals(insurance_carrier);
CREATE INDEX idx_renewals_policy_number ON renewals(policy_number);
CREATE INDEX idx_renewals_insured_name ON renewals(insured_name);
CREATE INDEX idx_renewals_assigned_to ON renewals(assigned_to);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_renewals_updated_at
BEFORE UPDATE ON renewals
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all renewals"
  ON renewals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert renewals"
  ON renewals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update renewals"
  ON renewals FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete renewals"
  ON renewals FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- DONE! Now try the QQCatalyst import again
-- ========================================
