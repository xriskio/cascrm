-- Drop the existing table if it exists
DROP TABLE IF EXISTS carrier_contacts;

-- Create carrier_contacts table with all required fields
-- Using VARCHAR for specialties instead of TEXT[]
CREATE TABLE carrier_contacts (
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
  specialties VARCHAR(500), -- Changed from TEXT[] to VARCHAR
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_carrier_contacts_insurance_carrier ON carrier_contacts(insurance_carrier);
