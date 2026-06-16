-- ================================================================================
-- COMPLETE DATABASE SETUP FOR INSURETRAC + QQCATALYST INTEGRATIONS
-- ================================================================================
-- Run this in Supabase SQL Editor to create all tables needed for:
-- 1. Renewals import from QQCatalyst
-- 2. Clients/Contacts import from QQCatalyst
-- 3. Policy details fetching
-- 4. Future QQCatalyst integrations
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase project
-- 2. Click SQL Editor in the left sidebar
-- 3. Copy and paste this ENTIRE script
-- 4. Click "Run" button
-- 5. Verify all tables are created successfully
-- ================================================================================

-- ================================================================================
-- SECTION 1: RENEWALS TABLE (For QQCatalyst Policy Import)
-- ================================================================================

-- Drop existing renewals table if exists
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
  expiring_premium DECIMAL(12,2),
  expiring_commission DECIMAL(12,2),
  wholesaler_mga TEXT,
  renewal_premium DECIMAL(12,2),
  renewal_commission DECIMAL(12,2),
  commission_amount DECIMAL(12,2),
  commission_percent DECIMAL(5,2),
  fees DECIMAL(12,2),
  
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
  
  -- QQCatalyst integration
  qq_policy_id TEXT,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for renewals table
CREATE INDEX idx_renewals_expiration_date ON renewals(expiration_date);
CREATE INDEX idx_renewals_status ON renewals(status);
CREATE INDEX idx_renewals_insurance_carrier ON renewals(insurance_carrier);
CREATE INDEX idx_renewals_policy_number ON renewals(policy_number);
CREATE INDEX idx_renewals_insured_name ON renewals(insured_name);
CREATE INDEX idx_renewals_assigned_to ON renewals(assigned_to);
CREATE INDEX idx_renewals_qq_policy_id ON renewals(qq_policy_id);

-- Enable Row Level Security for renewals
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for renewals
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

-- ================================================================================
-- SECTION 2: CLIENTS TABLE (For QQCatalyst Contacts Import)
-- ================================================================================

-- Drop existing clients table if exists
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
  -- Primary key and identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_number TEXT UNIQUE NOT NULL,
  
  -- Basic information
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT,
  
  -- Contact information
  email TEXT,
  phone TEXT,
  fax TEXT,
  website TEXT,
  preferred_contact_method TEXT,
  
  -- Address information
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  
  -- Client classification
  client_type TEXT, -- Individual, Business, etc.
  industry TEXT,
  status TEXT DEFAULT 'active',
  
  -- Financial information
  total_premium DECIMAL(12,2),
  annual_premium DECIMAL(12,2),
  
  -- Relationship information
  account_manager TEXT,
  assigned_agent TEXT,
  referral_source TEXT,
  
  -- Policy information
  policy_count INTEGER DEFAULT 0,
  renewal_date DATE,
  
  -- QQCatalyst integration
  qq_contact_id TEXT UNIQUE,
  qq_customer_id TEXT,
  contact_type TEXT,
  location_id TEXT,
  entity_id TEXT,
  
  -- Additional data
  notes TEXT,
  tags TEXT[],
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for clients table
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_qq_contact_id ON clients(qq_contact_id);
CREATE INDEX idx_clients_renewal_date ON clients(renewal_date);
CREATE INDEX idx_clients_business_name ON clients(business_name);

-- Enable Row Level Security for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- ================================================================================
-- SECTION 3: CONTACTS TABLE (For QQCatalyst Contacts Details)
-- ================================================================================

-- Drop existing contacts table if exists
DROP TABLE IF EXISTS contacts CASCADE;

-- Create contacts table
CREATE TABLE contacts (
  -- Primary key and identifiers
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
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_client_id ON contacts(client_id);
CREATE INDEX idx_contacts_qq_contact_id ON contacts(qq_contact_id);
CREATE INDEX idx_contacts_full_name ON contacts(full_name);

-- Enable Row Level Security for contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
CREATE POLICY "Users can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- ================================================================================
-- SECTION 4: POLICIES TABLE (For QQCatalyst Policy Details)
-- ================================================================================

-- Drop existing policies table if exists
DROP TABLE IF EXISTS policies CASCADE;

-- Create policies table
CREATE TABLE policies (
  -- Primary key and identifiers
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
CREATE INDEX idx_policies_policy_number ON policies(policy_number);
CREATE INDEX idx_policies_client_id ON policies(client_id);
CREATE INDEX idx_policies_expiration_date ON policies(expiration_date);
CREATE INDEX idx_policies_policy_status ON policies(policy_status);
CREATE INDEX idx_policies_qq_policy_id ON policies(qq_policy_id);
CREATE INDEX idx_policies_insurance_carrier ON policies(insurance_carrier);

-- Enable Row Level Security for policies
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for policies table
CREATE POLICY "Users can view all policies"
  ON policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete policies"
  ON policies FOR DELETE
  TO authenticated
  USING (true);

-- ================================================================================
-- SECTION 5: CARRIER CONTACTS TABLE (For QQCatalyst Carriers Import)
-- ================================================================================

-- Note: This table may already exist, so we'll skip if it does
CREATE TABLE IF NOT EXISTS carrier_contacts (
  -- Primary key and identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_number TEXT UNIQUE NOT NULL,
  
  -- Carrier information
  carrier_name TEXT NOT NULL,
  carrier_code TEXT,
  
  -- Contact information
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  fax TEXT,
  website TEXT,
  
  -- Address information
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Additional information
  am_best_rating TEXT,
  naic_code TEXT,
  notes TEXT,
  
  -- QQCatalyst integration
  qq_carrier_id TEXT UNIQUE,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for carrier_contacts table
CREATE INDEX IF NOT EXISTS idx_carrier_contacts_carrier_name ON carrier_contacts(carrier_name);
CREATE INDEX IF NOT EXISTS idx_carrier_contacts_qq_carrier_id ON carrier_contacts(qq_carrier_id);

-- Enable Row Level Security for carrier_contacts
ALTER TABLE carrier_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for carrier_contacts (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'carrier_contacts' AND policyname = 'Users can view all carrier contacts'
  ) THEN
    CREATE POLICY "Users can view all carrier contacts"
      ON carrier_contacts FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ================================================================================
-- SECTION 6: AUTO-UPDATE TRIGGERS
-- ================================================================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_renewals_updated_at ON renewals;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
DROP TRIGGER IF EXISTS update_carrier_contacts_updated_at ON carrier_contacts;

-- Create triggers for all tables
CREATE TRIGGER update_renewals_updated_at
  BEFORE UPDATE ON renewals
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_carrier_contacts_updated_at
  BEFORE UPDATE ON carrier_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ================================================================================
-- SECTION 7: VERIFICATION QUERIES
-- ================================================================================

-- Run these to verify all tables were created successfully
SELECT 'Renewals table' as table_name, COUNT(*) as columns 
FROM information_schema.columns 
WHERE table_name = 'renewals'
UNION ALL
SELECT 'Clients table', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'clients'
UNION ALL
SELECT 'Contacts table', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'contacts'
UNION ALL
SELECT 'Policies table', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'policies'
UNION ALL
SELECT 'Carrier contacts table', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'carrier_contacts';

-- ================================================================================
-- SETUP COMPLETE!
-- ================================================================================
-- 
-- All tables have been created successfully. You can now:
-- 1. Import renewals from QQCatalyst: POST /api/qqcatalyst/policies/fetch-renewals
-- 2. Import clients from QQCatalyst: GET /api/qqcatalyst/contacts/import
-- 3. Fetch policy details: POST /api/qqcatalyst/policies/get-details
--
-- For more information, see: QQCATALYST_API_INTEGRATIONS.md
-- ================================================================================
