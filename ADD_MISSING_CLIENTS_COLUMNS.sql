-- ================================================================================
-- ADD MISSING COLUMNS TO CLIENTS TABLE
-- ================================================================================
-- This script adds all missing QQCatalyst integration columns to the clients table
-- Run this in Supabase SQL Editor
-- ================================================================================

-- Add missing columns to clients table (only if they don't exist)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_number TEXT UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_premium DECIMAL(12,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS annual_premium DECIMAL(12,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS account_manager TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS assigned_agent TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS policy_count INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS renewal_date DATE;

-- QQCatalyst integration columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS qq_contact_id TEXT UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS qq_customer_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_type TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS location_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS entity_id TEXT;

-- Additional data columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS json_raw JSONB;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_clients_client_number ON clients(client_number);
CREATE INDEX IF NOT EXISTS idx_clients_business_name ON clients(business_name);
CREATE INDEX IF NOT EXISTS idx_clients_qq_contact_id ON clients(qq_contact_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_renewal_date ON clients(renewal_date);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients'
ORDER BY ordinal_position;
