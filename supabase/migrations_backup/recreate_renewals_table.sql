-- Drop the existing renewals table if it exists
DROP TABLE IF EXISTS renewals;

-- Create a new renewals table with the correct structure
CREATE TABLE renewals (
  -- Primary key and identifiers
  id SERIAL PRIMARY KEY,
  renewal_id TEXT UNIQUE NOT NULL,
  
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
  
  -- Financial information
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
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on expiration_date for faster queries
CREATE INDEX idx_renewals_expiration_date ON renewals(expiration_date);

-- Create an index on status for faster filtering
CREATE INDEX idx_renewals_status ON renewals(status);

-- Create an index on insurance_carrier for faster filtering
CREATE INDEX idx_renewals_insurance_carrier ON renewals(insurance_carrier);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_renewals_updated_at ON renewals;
CREATE TRIGGER update_renewals_updated_at
BEFORE UPDATE ON renewals
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add some example data
INSERT INTO renewals (
  renewal_id, 
  insured_name, 
  policy_type, 
  expiration_date, 
  insurance_carrier, 
  expiring_premium, 
  status
) VALUES 
('REN-00001', 'ABC Company', 'General Liability', '2025-07-15', 'Travelers', 5000.00, 'pending'),
('REN-00002', 'XYZ Corporation', 'Commercial Auto', '2025-08-01', 'Progressive', 7500.00, 'pending'),
('REN-00003', '123 Industries', 'Workers Comp', '2025-06-30', 'Hartford', 12000.00, 'quoted');
