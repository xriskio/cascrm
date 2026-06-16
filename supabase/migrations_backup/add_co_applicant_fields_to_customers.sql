-- Add co-applicant fields to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS co_applicant_first_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_middle_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_last_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_dob DATE,
ADD COLUMN IF NOT EXISTS co_applicant_ssn_last_four TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_email TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_phone TEXT,
ADD COLUMN IF NOT EXISTS relationship_to_primary TEXT,
ADD COLUMN IF NOT EXISTS has_co_applicant BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_co_applicant_email ON customers(co_applicant_email);
CREATE INDEX IF NOT EXISTS idx_customers_has_co_applicant ON customers(has_co_applicant);

-- Add comments for documentation
COMMENT ON COLUMN customers.co_applicant_first_name IS 'Co-applicant first name';
COMMENT ON COLUMN customers.co_applicant_middle_name IS 'Co-applicant middle name';
COMMENT ON COLUMN customers.co_applicant_last_name IS 'Co-applicant last name';
COMMENT ON COLUMN customers.co_applicant_dob IS 'Co-applicant date of birth';
COMMENT ON COLUMN customers.co_applicant_ssn_last_four IS 'Last 4 digits of co-applicant SSN';
COMMENT ON COLUMN customers.co_applicant_email IS 'Co-applicant email address';
COMMENT ON COLUMN customers.co_applicant_phone IS 'Co-applicant phone number';
COMMENT ON COLUMN customers.relationship_to_primary IS 'Relationship of co-applicant to primary applicant';
COMMENT ON COLUMN customers.has_co_applicant IS 'Whether this customer has a co-applicant';
