-- First, let's check what columns actually exist in the clients table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to clients table if they don't exist
DO $$ 
BEGIN
    -- Add contact name fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_first_name') THEN
        ALTER TABLE clients ADD COLUMN contact_first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_last_name') THEN
        ALTER TABLE clients ADD COLUMN contact_last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_middle_name') THEN
        ALTER TABLE clients ADD COLUMN contact_middle_name TEXT;
    END IF;
    
    -- Add personal information fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'salutation') THEN
        ALTER TABLE clients ADD COLUMN salutation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'nickname') THEN
        ALTER TABLE clients ADD COLUMN nickname TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'date_of_birth') THEN
        ALTER TABLE clients ADD COLUMN date_of_birth DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'marital_status') THEN
        ALTER TABLE clients ADD COLUMN marital_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'gender') THEN
        ALTER TABLE clients ADD COLUMN gender TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'social_security') THEN
        ALTER TABLE clients ADD COLUMN social_security TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'preferred_language') THEN
        ALTER TABLE clients ADD COLUMN preferred_language TEXT DEFAULT 'English';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'residency_type') THEN
        ALTER TABLE clients ADD COLUMN residency_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'business_owner') THEN
        ALTER TABLE clients ADD COLUMN business_owner BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'industry') THEN
        ALTER TABLE clients ADD COLUMN industry TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'occupation') THEN
        ALTER TABLE clients ADD COLUMN occupation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'driver_license_number') THEN
        ALTER TABLE clients ADD COLUMN driver_license_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'driver_license_state') THEN
        ALTER TABLE clients ADD COLUMN driver_license_state TEXT;
    END IF;
    
    -- Add account information fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'priority') THEN
        ALTER TABLE clients ADD COLUMN priority TEXT DEFAULT 'Normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'customer_since') THEN
        ALTER TABLE clients ADD COLUMN customer_since DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'agent_name') THEN
        ALTER TABLE clients ADD COLUMN agent_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'csr_name') THEN
        ALTER TABLE clients ADD COLUMN csr_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'created_by') THEN
        ALTER TABLE clients ADD COLUMN created_by TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'customer_source') THEN
        ALTER TABLE clients ADD COLUMN customer_source TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'source_detail') THEN
        ALTER TABLE clients ADD COLUMN source_detail TEXT;
    END IF;
    
    -- Add contact preference fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_preference') THEN
        ALTER TABLE clients ADD COLUMN contact_preference JSONB DEFAULT '{}';
    END IF;
    
    -- Add social media fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'social_media') THEN
        ALTER TABLE clients ADD COLUMN social_media JSONB DEFAULT '{}';
    END IF;
    
    -- Add address fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'street_address') THEN
        ALTER TABLE clients ADD COLUMN street_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'street_address_2') THEN
        ALTER TABLE clients ADD COLUMN street_address_2 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'city') THEN
        ALTER TABLE clients ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'state') THEN
        ALTER TABLE clients ADD COLUMN state TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'zip_code') THEN
        ALTER TABLE clients ADD COLUMN zip_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'country') THEN
        ALTER TABLE clients ADD COLUMN country TEXT DEFAULT 'United States';
    END IF;
    
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_contact_name ON clients(contact_first_name, contact_last_name);
CREATE INDEX IF NOT EXISTS idx_clients_customer_since ON clients(customer_since);
CREATE INDEX IF NOT EXISTS idx_clients_agent ON clients(agent_name);
