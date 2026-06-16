-- Add comprehensive contact fields to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS ssn_last4 TEXT,
ADD COLUMN IF NOT EXISTS mailing_address TEXT,
ADD COLUMN IF NOT EXISTS mailing_city TEXT,
ADD COLUMN IF NOT EXISTS mailing_state TEXT,
ADD COLUMN IF NOT EXISTS mailing_zip TEXT,
ADD COLUMN IF NOT EXISTS mailing_country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS primary_phone_type TEXT,
ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
ADD COLUMN IF NOT EXISTS secondary_phone_type TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT,
ADD COLUMN IF NOT EXISTS employer TEXT,
ADD COLUMN IF NOT EXISTS years_at_current_employer INTEGER,
ADD COLUMN IF NOT EXISTS annual_income DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS co_applicant_first_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_last_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_relationship TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_dob DATE,
ADD COLUMN IF NOT EXISTS current_insurance_carrier TEXT,
ADD COLUMN IF NOT EXISTS years_with_current_carrier INTEGER,
ADD COLUMN IF NOT EXISTS current_policy_expiration DATE,
ADD COLUMN IF NOT EXISTS current_premium DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS policy_homeowners BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_auto BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_umbrella BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_boat BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_motorcycle BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_rv BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS desired_effective_date DATE;

-- Create indexes for better performance on commonly searched fields
CREATE INDEX IF NOT EXISTS idx_customers_first_name ON customers(first_name);
CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name);
CREATE INDEX IF NOT EXISTS idx_customers_mailing_zip ON customers(mailing_zip);
CREATE INDEX IF NOT EXISTS idx_customers_employer ON customers(employer);
CREATE INDEX IF NOT EXISTS idx_customers_current_insurance_carrier ON customers(current_insurance_carrier);

-- Update existing records to populate first_name and last_name from name field
UPDATE customers 
SET 
  first_name = CASE 
    WHEN name IS NOT NULL AND name != '' THEN 
      TRIM(SPLIT_PART(name, ' ', 1))
    ELSE NULL 
  END,
  last_name = CASE 
    WHEN name IS NOT NULL AND name != '' AND ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 THEN 
      TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1))
    ELSE NULL 
  END
WHERE first_name IS NULL AND last_name IS NULL AND name IS NOT NULL AND name != '';
