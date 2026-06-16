-- Enhanced clients table to support QQCatalyst API data
CREATE TABLE IF NOT EXISTS clients_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- QQCatalyst Contact Information
  qq_contact_id VARCHAR UNIQUE,
  qq_entity_id VARCHAR,
  qq_customer_number VARCHAR,
  
  -- Basic Information
  first_name VARCHAR,
  last_name VARCHAR,
  middle_name VARCHAR,
  full_name VARCHAR,
  display_name VARCHAR,
  salutation VARCHAR,
  
  -- Business Information
  business_name VARCHAR,
  dba_name VARCHAR,
  legal_name VARCHAR,
  business_type VARCHAR,
  industry_type VARCHAR,
  
  -- Contact Information
  email VARCHAR,
  phone VARCHAR,
  mobile_phone VARCHAR,
  work_phone VARCHAR,
  fax VARCHAR,
  website VARCHAR,
  
  -- Address Information
  address_line1 VARCHAR,
  address_line2 VARCHAR,
  city VARCHAR,
  state VARCHAR(2),
  zip_code VARCHAR,
  country VARCHAR DEFAULT 'US',
  
  -- Mailing Address (if different)
  mailing_address_line1 VARCHAR,
  mailing_address_line2 VARCHAR,
  mailing_city VARCHAR,
  mailing_state VARCHAR(2),
  mailing_zip_code VARCHAR,
  mailing_country VARCHAR,
  
  -- Personal Information
  date_of_birth DATE,
  ssn VARCHAR,
  drivers_license_number VARCHAR,
  drivers_license_state VARCHAR(2),
  marital_status VARCHAR,
  gender VARCHAR,
  
  -- Business Information
  federal_tax_id VARCHAR,
  state_tax_id VARCHAR,
  years_in_business INTEGER,
  number_of_employees INTEGER,
  annual_revenue DECIMAL(15,2),
  
  -- Account Information
  customer_since DATE,
  customer_status VARCHAR,
  customer_type VARCHAR,
  prospect_status BOOLEAN DEFAULT false,
  
  -- Agent/CSR Information
  agent_id VARCHAR,
  agent_name VARCHAR,
  csr_id VARCHAR,
  csr_name VARCHAR,
  
  -- Preferences
  preferred_language VARCHAR DEFAULT 'en',
  communication_preference VARCHAR,
  marketing_opt_in BOOLEAN DEFAULT true,
  
  -- Financial Information
  credit_rating VARCHAR,
  payment_terms VARCHAR,
  billing_method VARCHAR,
  
  -- Additional Information
  referral_source VARCHAR,
  notes TEXT,
  tags VARCHAR[],
  
  -- QQCatalyst Raw Data
  qq_raw_data JSONB,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  last_sync_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL),
  CONSTRAINT valid_phone CHECK (phone ~* '^[\+]?[1-9][\d\s\-$$$$\.]{7,15}$' OR phone IS NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_enhanced_qq_contact ON clients_enhanced(qq_contact_id);
CREATE INDEX IF NOT EXISTS idx_clients_enhanced_email ON clients_enhanced(email);
CREATE INDEX IF NOT EXISTS idx_clients_enhanced_name ON clients_enhanced(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_clients_enhanced_business ON clients_enhanced(business_name);
CREATE INDEX IF NOT EXISTS idx_clients_enhanced_agent ON clients_enhanced(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_enhanced_status ON clients_enhanced(customer_status);

-- Enable RLS

-- Create RLS policies
