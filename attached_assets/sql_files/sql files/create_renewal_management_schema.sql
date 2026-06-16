-- Create renewal groups table
CREATE TABLE IF NOT EXISTS renewal_groups (
  id SERIAL PRIMARY KEY,
  group_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  renewal_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'bound', 'declined')),
  total_premium DECIMAL(12,2),
  agent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies table
CREATE TABLE IF NOT EXISTS renewal_policies (
  id SERIAL PRIMARY KEY,
  renewal_group_id INTEGER REFERENCES renewal_groups(id) ON DELETE CASCADE,
  policy_number TEXT,
  line_of_business TEXT NOT NULL,
  carrier TEXT,
  effective_date DATE,
  expiration_date DATE,
  premium DECIMAL(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'bound', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coverages table
CREATE TABLE IF NOT EXISTS policy_coverages (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  coverage_type TEXT NOT NULL,
  limit_of_liability TEXT,
  sublimit TEXT,
  premium DECIMAL(12,2),
  deductible TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS policy_vehicles (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  vin TEXT,
  year INTEGER,
  make TEXT,
  model TEXT,
  garaging_address TEXT,
  radius INTEGER,
  tiv DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS policy_drivers (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  license_number TEXT,
  license_state TEXT,
  years_experience INTEGER,
  surcharge_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create endorsements table
CREATE TABLE IF NOT EXISTS policy_endorsements (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  endorsement_code TEXT NOT NULL,
  endorsement_name TEXT NOT NULL,
  premium DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exclusions table
CREATE TABLE IF NOT EXISTS policy_exclusions (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES renewal_policies(id) ON DELETE CASCADE,
  exclusion_code TEXT NOT NULL,
  exclusion_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create master endorsements table
CREATE TABLE IF NOT EXISTS master_endorsements (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  line_of_business TEXT NOT NULL,
  premium DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create master exclusions table
CREATE TABLE IF NOT EXISTS master_exclusions (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  line_of_business TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample endorsements
INSERT INTO master_endorsements (code, name, line_of_business, premium) VALUES
('GL001', 'Additional Insured - Owners, Lessees or Contractors', 'General Liability', 25.00),
('GL002', 'Waiver of Subrogation', 'General Liability', 50.00),
('GL003', 'Primary and Non-Contributory', 'General Liability', 75.00),
('CA001', 'Hired Auto Physical Damage', 'Commercial Auto', 150.00),
('CA002', 'Employee as Additional Insured', 'Commercial Auto', 25.00),
('CA003', 'Waiver of Subrogation', 'Commercial Auto', 50.00),
('WC001', 'Waiver of Subrogation', 'Workers Compensation', 100.00),
('WC002', 'Alternate Employer', 'Workers Compensation', 75.00),
('PROP001', 'Ordinance or Law Coverage', 'Commercial Property', 200.00),
('PROP002', 'Equipment Breakdown', 'Commercial Property', 300.00);

-- Insert sample exclusions
INSERT INTO master_exclusions (code, name, line_of_business) VALUES
('GL-EX001', 'Professional Services Exclusion', 'General Liability'),
('GL-EX002', 'Pollution Exclusion', 'General Liability'),
('CA-EX001', 'Racing Exclusion', 'Commercial Auto'),
('CA-EX002', 'Mexico Coverage Exclusion', 'Commercial Auto'),
('WC-EX001', 'Aircraft Operations Exclusion', 'Workers Compensation'),
('PROP-EX001', 'Flood Exclusion', 'Commercial Property'),
('PROP-EX002', 'Earthquake Exclusion', 'Commercial Property');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_renewal_groups_status ON renewal_groups(status);
CREATE INDEX IF NOT EXISTS idx_renewal_policies_group_id ON renewal_policies(renewal_group_id);
CREATE INDEX IF NOT EXISTS idx_policy_coverages_policy_id ON policy_coverages(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_vehicles_policy_id ON policy_vehicles(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_drivers_policy_id ON policy_drivers(policy_id);
CREATE INDEX IF NOT EXISTS idx_master_endorsements_lob ON master_endorsements(line_of_business);
CREATE INDEX IF NOT EXISTS idx_master_exclusions_lob ON master_exclusions(line_of_business);
