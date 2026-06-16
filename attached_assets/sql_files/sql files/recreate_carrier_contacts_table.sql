-- Drop the existing table if it exists
DROP TABLE IF EXISTS carrier_contacts;

-- Create carrier_contacts table with all required fields
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
  specialties TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_carrier_contacts_insurance_carrier ON carrier_contacts(insurance_carrier);
CREATE INDEX idx_carrier_contacts_specialties ON carrier_contacts USING GIN(specialties);

-- Insert a test record to verify the table structure
INSERT INTO carrier_contacts (
  insurance_carrier,
  producer_code,
  website_link,
  website_login,
  agency_user_id,
  password,
  customer_service_phone,
  billing_phone,
  agency_contact,
  agency_contact_number,
  agency_contact_email,
  underwriter_contact,
  underwriter_number,
  underwriter_email,
  loss_run_request_link,
  claims_email,
  claims_phone_number,
  specialties,
  notes
) VALUES (
  'ABIC',
  '99999999',
  'https://abic.example.com',
  'agencylogin',
  'agency123',
  'password123',
  '(800) 555-1234',
  '(800) 555-5678',
  'John Smith',
  '(555) 123-4567',
  'john.smith@example.com',
  'Jane Doe',
  '(555) 987-6543',
  'jane.doe@example.com',
  'https://abic.example.com/lossruns',
  'claims@abic.example.com',
  '(800) 555-9876',
  ARRAY['PUBLIC AUTO', 'NEMT'],
  'Test carrier record'
);
