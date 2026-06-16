-- ================================================================================
-- CREATE MISSING TABLES FOR QQCATALYST INTEGRATIONS
-- ================================================================================
-- This script creates contacts and policies tables if they don't exist
-- Run this in Supabase SQL Editor
-- ================================================================================

-- ================================================================================
-- CONTACTS TABLE
-- ================================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_number TEXT UNIQUE NOT NULL,
  
  -- Basic information
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  business_name TEXT,
  
  -- Contact information
  email TEXT,
  phone TEXT,
  mobile TEXT,
  fax TEXT,
  
  -- Address information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,
  country TEXT DEFAULT 'USA',
  
  -- Contact details
  title TEXT,
  department TEXT,
  contact_type TEXT,
  status TEXT DEFAULT 'active',
  
  -- Relationships
  client_id UUID REFERENCES clients(id),
  location_id TEXT,
  
  -- QQCatalyst integration
  qq_contact_id TEXT UNIQUE,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_qq_contact_id ON contacts(qq_contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_full_name ON contacts(full_name);

-- Enable Row Level Security for contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can view all contacts'
  ) THEN
    CREATE POLICY "Users can view all contacts"
      ON contacts FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can insert contacts'
  ) THEN
    CREATE POLICY "Users can insert contacts"
      ON contacts FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can update contacts'
  ) THEN
    CREATE POLICY "Users can update contacts"
      ON contacts FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can delete contacts'
  ) THEN
    CREATE POLICY "Users can delete contacts"
      ON contacts FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ================================================================================
-- POLICIES TABLE
-- ================================================================================

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number TEXT UNIQUE NOT NULL,
  
  -- Policy basic information
  policy_type TEXT,
  line_of_business TEXT,
  policy_status TEXT DEFAULT 'active',
  
  -- Dates
  effective_date DATE,
  expiration_date DATE,
  inception_date DATE,
  cancellation_date DATE,
  
  -- Client/Insured information
  client_id UUID REFERENCES clients(id),
  insured_name TEXT,
  
  -- Carrier information
  insurance_carrier TEXT,
  carrier_code TEXT,
  carrier_policy_number TEXT,
  
  -- Financial information
  total_premium DECIMAL(12,2),
  annual_premium DECIMAL(12,2),
  commission_amount DECIMAL(12,2),
  commission_percent DECIMAL(5,2),
  fees DECIMAL(12,2),
  
  -- Coverage information
  coverage_limits TEXT,
  deductibles TEXT,
  
  -- Agent information
  producer TEXT,
  account_manager TEXT,
  mga_wholesaler TEXT,
  
  -- QQCatalyst integration
  qq_policy_id TEXT UNIQUE,
  qq_location_id TEXT,
  json_raw JSONB,
  
  -- Additional information
  notes TEXT,
  documents TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for policies table
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_expiration_date ON policies(expiration_date);
CREATE INDEX IF NOT EXISTS idx_policies_policy_status ON policies(policy_status);
CREATE INDEX IF NOT EXISTS idx_policies_qq_policy_id ON policies(qq_policy_id);
CREATE INDEX IF NOT EXISTS idx_policies_insurance_carrier ON policies(insurance_carrier);

-- Enable Row Level Security for policies
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for policies table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can view all policies'
  ) THEN
    CREATE POLICY "Users can view all policies"
      ON policies FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can insert policies'
  ) THEN
    CREATE POLICY "Users can insert policies"
      ON policies FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can update policies'
  ) THEN
    CREATE POLICY "Users can update policies"
      ON policies FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can delete policies'
  ) THEN
    CREATE POLICY "Users can delete policies"
      ON policies FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ================================================================================
-- AUTO-UPDATE TRIGGERS
-- ================================================================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new tables
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Verify tables were created
SELECT 'contacts' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'contacts'
UNION ALL
SELECT 'policies', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'policies';
