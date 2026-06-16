-- Add home owners specific fields to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS co_applicant_first_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_middle_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_last_name TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_dob DATE,
ADD COLUMN IF NOT EXISTS co_applicant_ssn_last_four TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_email TEXT,
ADD COLUMN IF NOT EXISTS co_applicant_phone TEXT,
ADD COLUMN IF NOT EXISTS relationship_to_primary TEXT,
ADD COLUMN IF NOT EXISTS has_co_applicant BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dwelling_replacement_cost NUMERIC,
ADD COLUMN IF NOT EXISTS custom_dwelling_amount NUMERIC,
ADD COLUMN IF NOT EXISTS personal_property NUMERIC,
ADD COLUMN IF NOT EXISTS custom_personal_property_amount NUMERIC,
ADD COLUMN IF NOT EXISTS other_structures NUMERIC,
ADD COLUMN IF NOT EXISTS loss_of_use NUMERIC,
ADD COLUMN IF NOT EXISTS liability NUMERIC,
ADD COLUMN IF NOT EXISTS medical_payments NUMERIC,
ADD COLUMN IF NOT EXISTS standard_perils_deductible NUMERIC,
ADD COLUMN IF NOT EXISTS wind_hail_deductible NUMERIC,
ADD COLUMN IF NOT EXISTS wind_hail_roof_settlement TEXT,
ADD COLUMN IF NOT EXISTS roof_payment_schedule TEXT,
ADD COLUMN IF NOT EXISTS water_backup BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS water_backup_amount NUMERIC,
ADD COLUMN IF NOT EXISTS equipment_breakdown BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS equipment_breakdown_amount NUMERIC,
ADD COLUMN IF NOT EXISTS buried_service_lines BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS buried_service_lines_amount NUMERIC,
ADD COLUMN IF NOT EXISTS personal_cyber BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS personal_cyber_amount NUMERIC,
ADD COLUMN IF NOT EXISTS identity_theft BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identity_theft_amount NUMERIC,
ADD COLUMN IF NOT EXISTS enhanced_replacement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enhanced_replacement_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS ordinance_or_law BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ordinance_or_law_amount NUMERIC,
ADD COLUMN IF NOT EXISTS scheduled_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS named_insureds JSONB DEFAULT '[]'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_dwelling_cost ON submissions(dwelling_replacement_cost);
CREATE INDEX IF NOT EXISTS idx_submissions_liability ON submissions(liability);
CREATE INDEX IF NOT EXISTS idx_submissions_has_co_applicant ON submissions(has_co_applicant);

-- Add comments
COMMENT ON COLUMN submissions.dwelling_replacement_cost IS 'Main dwelling replacement cost';
COMMENT ON COLUMN submissions.personal_property IS 'Personal property coverage amount';
COMMENT ON COLUMN submissions.liability IS 'Liability coverage amount';
COMMENT ON COLUMN submissions.scheduled_items IS 'JSON array of scheduled items with specific coverage';
COMMENT ON COLUMN submissions.named_insureds IS 'JSON array of named insureds';
