-- Create carrier_contacts table
CREATE TABLE IF NOT EXISTS carrier_contacts (
  id SERIAL PRIMARY KEY,
  insurance_carrier VARCHAR(255) NOT NULL,
  producer_code VARCHAR(100),
  website_login VARCHAR(100),
  website_link VARCHAR(255),
  agency_user_id VARCHAR(100),
  password VARCHAR(255),
  customer_service_phone VARCHAR(20),
  billing_phone VARCHAR(20),
  agency_contact VARCHAR(100),
  agency_contact_number VARCHAR(20),
  agency_contact_email VARCHAR(255),
  underwriter_contact VARCHAR(100),
  underwriter_number VARCHAR(20),
  underwriter_email VARCHAR(255),
  loss_run_request_link VARCHAR(255),
  claims_email VARCHAR(255),
  claims_phone_number VARCHAR(20),
  specialties TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on insurance_carrier for faster searches
CREATE INDEX IF NOT EXISTS idx_carrier_contacts_insurance_carrier ON carrier_contacts(insurance_carrier);
