-- Drop existing tables if they exist to recreate with proper structure
DROP TABLE IF EXISTS policy_exclusions CASCADE;
DROP TABLE IF EXISTS policy_endorsements CASCADE;
DROP TABLE IF EXISTS policy_drivers CASCADE;
DROP TABLE IF EXISTS policy_vehicles CASCADE;
DROP TABLE IF EXISTS policy_coverages CASCADE;
DROP TABLE IF EXISTS renewal_policies CASCADE;
DROP TABLE IF EXISTS renewal_groups CASCADE;

-- Create renewal groups table (main container for client renewals)
CREATE TABLE renewal_groups (
  id SERIAL PRIMARY KEY,
  group_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  renewal_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'bound', 'declined', 'cancelled')),
  total_premium DECIMAL(12,2) DEFAULT 0,
  total_commission DECIMAL(12,2) DEFAULT 0,
  agent_id TEXT,
  producer TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies table (individual policies within a renewal group)
CREATE TABLE renewal_policies (
  id SERIAL PRIMARY KEY,
  renewal_group_id INTEGER REFERENCES renewal_groups(id) ON DELETE CASCADE,
  policy_number TEXT,
  line_of_business TEXT NOT NULL CHECK (line_of_business IN (
    'General Liability', 'Commercial Auto', 'Workers Compensation', 
    'Commercial Property', 'Umbrella', 'Professional Liability', 
    'Cyber Liability', 'EPLI', 'D&O', 'Crime', 'Inland Marine'
  )),
  carrier TEXT,
  effective_date DATE,
  expiration_date DATE,
  premium DECIMAL(12,2) DEFAULT 0,
  commission DECIMAL(12,2) DEFAULT 0,
  commission_rate DECIMAL(5,2),
  deductible TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'bound', 'declined')),
  quote_number TEXT,
  policy_limits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coverages table (dynamic coverages per policy)
CREATE TABLE policy_coverages (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  coverage_type TEXT NOT NULL,
  coverage_name TEXT NOT NULL,
  limit_of_liability TEXT,
  sublimit TEXT,
  premium DECIMAL(12,2) DEFAULT 0,
  deductible TEXT,
  rate DECIMAL(8,4),
  exposure TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table (for auto lines)
CREATE TABLE policy_vehicles (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  vin TEXT,
  year INTEGER,
  make TEXT,
  model TEXT,
  body_type TEXT,
  garaging_address TEXT,
  garaging_city TEXT,
  garaging_state TEXT,
  garaging_zip TEXT,
  radius INTEGER,
  tiv DECIMAL(12,2),
  usage TEXT,
  classification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table (for auto lines)
CREATE TABLE policy_drivers (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  license_number TEXT,
  license_state TEXT,
  license_type TEXT,
  years_experience INTEGER,
  years_with_company INTEGER,
  surcharge_flag BOOLEAN DEFAULT FALSE,
  violation_points INTEGER DEFAULT 0,
  accident_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create endorsements table
CREATE TABLE policy_endorsements (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  endorsement_code TEXT NOT NULL,
  endorsement_name TEXT NOT NULL,
  premium DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exclusions table
CREATE TABLE policy_exclusions (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  exclusion_code TEXT NOT NULL,
  exclusion_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update master endorsements with more comprehensive data
TRUNCATE master_endorsements;
INSERT INTO master_endorsements (code, name, line_of_business, premium) VALUES
-- General Liability
('GL001', 'Additional Insured - Owners, Lessees or Contractors', 'General Liability', 25.00),
('GL002', 'Waiver of Subrogation', 'General Liability', 50.00),
('GL003', 'Primary and Non-Contributory', 'General Liability', 75.00),
('GL004', 'Blanket Additional Insured', 'General Liability', 100.00),
('GL005', 'Products/Completed Operations Coverage', 'General Liability', 150.00),

-- Commercial Auto
('CA001', 'Hired Auto Physical Damage', 'Commercial Auto', 150.00),
('CA002', 'Employee as Additional Insured', 'Commercial Auto', 25.00),
('CA003', 'Waiver of Subrogation', 'Commercial Auto', 50.00),
('CA004', 'Drive Other Car Coverage', 'Commercial Auto', 75.00),
('CA005', 'Mexico Coverage', 'Commercial Auto', 200.00),

-- Workers Compensation
('WC001', 'Waiver of Subrogation', 'Workers Compensation', 100.00),
('WC002', 'Alternate Employer', 'Workers Compensation', 75.00),
('WC003', 'Independent Contractors', 'Workers Compensation', 125.00),
('WC004', 'Foreign Coverage', 'Workers Compensation', 200.00),

-- Commercial Property
('PROP001', 'Ordinance or Law Coverage', 'Commercial Property', 200.00),
('PROP002', 'Equipment Breakdown', 'Commercial Property', 300.00),
('PROP003', 'Business Income', 'Commercial Property', 250.00),
('PROP004', 'Extra Expense', 'Commercial Property', 150.00),

-- Umbrella
('UMB001', 'Waiver of Subrogation', 'Umbrella', 100.00),
('UMB002', 'Additional Insured', 'Umbrella', 50.00),

-- Professional Liability
('PL001', 'Prior Acts Coverage', 'Professional Liability', 500.00),
('PL002', 'Extended Reporting Period', 'Professional Liability', 300.00),

-- Cyber Liability
('CYB001', 'Social Engineering Coverage', 'Cyber Liability', 250.00),
('CYB002', 'Business Email Compromise', 'Cyber Liability', 200.00);

-- Update master exclusions
TRUNCATE master_exclusions;
INSERT INTO master_exclusions (code, name, line_of_business) VALUES
-- General Liability
('GL-EX001', 'Professional Services Exclusion', 'General Liability'),
('GL-EX002', 'Pollution Exclusion', 'General Liability'),
('GL-EX003', 'Employment Practices Exclusion', 'General Liability'),
('GL-EX004', 'Cyber Liability Exclusion', 'General Liability'),

-- Commercial Auto
('CA-EX001', 'Racing Exclusion', 'Commercial Auto'),
('CA-EX002', 'Mexico Coverage Exclusion', 'Commercial Auto'),
('CA-EX003', 'Fellow Employee Exclusion', 'Commercial Auto'),

-- Workers Compensation
('WC-EX001', 'Aircraft Operations Exclusion', 'Workers Compensation'),
('WC-EX002', 'Maritime Operations Exclusion', 'Workers Compensation'),

-- Commercial Property
('PROP-EX001', 'Flood Exclusion', 'Commercial Property'),
('PROP-EX002', 'Earthquake Exclusion', 'Commercial Property'),
('PROP-EX003', 'Nuclear Exclusion', 'Commercial Property'),

-- Umbrella
('UMB-EX001', 'Professional Liability Exclusion', 'Umbrella'),
('UMB-EX002', 'Pollution Exclusion', 'Umbrella'),

-- Professional Liability
('PL-EX001', 'Bodily Injury Exclusion', 'Professional Liability'),
('PL-EX002', 'Property Damage Exclusion', 'Professional Liability'),

-- Cyber Liability
('CYB-EX001', 'War and Terrorism Exclusion', 'Cyber Liability'),
('CYB-EX002', 'Infrastructure Failure Exclusion', 'Cyber Liability');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_renewal_groups_status ON renewal_groups(status);
CREATE INDEX IF NOT EXISTS idx_renewal_groups_renewal_date ON renewal_groups(renewal_date);
CREATE INDEX IF NOT EXISTS idx_renewal_policies_group_id ON renewal_policies(renewal_group_id);
CREATE INDEX IF NOT EXISTS idx_renewal_policies_lob ON renewal_policies(line_of_business);
CREATE INDEX IF NOT EXISTS idx_policy_coverages_policy_id ON policy_coverages(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_vehicles_policy_id ON policy_vehicles(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_drivers_policy_id ON policy_drivers(policy_id);
CREATE INDEX IF NOT EXISTS idx_master_endorsements_lob ON master_endorsements(line_of_business);
CREATE INDEX IF NOT EXISTS idx_master_exclusions_lob ON master_exclusions(line_of_business);

-- Create function to generate group numbers
CREATE OR REPLACE FUNCTION generate_group_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'RG-' || TO_CHAR(EXTRACT(YEAR FROM NOW()), 'YYYY') || '-' || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM renewal_groups WHERE group_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update total premiums
CREATE OR REPLACE FUNCTION update_group_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE renewal_groups 
    SET 
        total_premium = (
            SELECT COALESCE(SUM(premium), 0) 
            FROM renewal_policies 
            WHERE renewal_group_id = COALESCE(NEW.renewal_group_id, OLD.renewal_group_id)
        ),
        total_commission = (
            SELECT COALESCE(SUM(commission), 0) 
            FROM renewal_policies 
            WHERE renewal_group_id = COALESCE(NEW.renewal_group_id, OLD.renewal_group_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.renewal_group_id, OLD.renewal_group_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update totals
DROP TRIGGER IF EXISTS trigger_update_group_totals_insert ON renewal_policies;
DROP TRIGGER IF EXISTS trigger_update_group_totals_update ON renewal_policies;
DROP TRIGGER IF EXISTS trigger_update_group_totals_delete ON renewal_policies;

CREATE TRIGGER trigger_update_group_totals_insert
    AFTER INSERT ON renewal_policies
    FOR EACH ROW EXECUTE FUNCTION update_group_totals();

CREATE TRIGGER trigger_update_group_totals_update
    AFTER UPDATE ON renewal_policies
    FOR EACH ROW EXECUTE FUNCTION update_group_totals();

CREATE TRIGGER trigger_update_group_totals_delete
    AFTER DELETE ON renewal_policies
    FOR EACH ROW EXECUTE FUNCTION update_group_totals();
