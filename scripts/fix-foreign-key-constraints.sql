-- Drop existing tables with foreign key issues and recreate them properly
DROP TABLE IF EXISTS policy_renewals CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- Create contacts table first (no dependencies)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT UNIQUE, -- QQ Contact ID
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  json_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table (references contacts)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT REFERENCES contacts(contact_id),
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  qq_contact_id TEXT,
  json_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies table (references contacts)
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT UNIQUE, -- QQ Policy ID
  contact_id TEXT REFERENCES contacts(contact_id),
  policy_number TEXT,
  line_of_business TEXT,
  effective_date DATE,
  expiration_date DATE,
  premium NUMERIC,
  status TEXT,
  json_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create renewals table (references policies)
CREATE TABLE renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_id TEXT UNIQUE,
  policy_id TEXT REFERENCES policies(policy_id),
  policy_number TEXT,
  client_name TEXT,
  insured_name TEXT,
  policy_type TEXT,
  expiration_date DATE,
  effective_date DATE,
  status TEXT DEFAULT 'pending',
  policy_premium NUMERIC,
  renewal_premium NUMERIC,
  insurance_carrier TEXT,
  json_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy_renewals table if needed (many-to-many relationship)
CREATE TABLE policy_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT REFERENCES policies(policy_id),
  renewal_id TEXT REFERENCES renewals(renewal_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(policy_id, renewal_id)
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_contact_id ON contacts(contact_id);
CREATE INDEX idx_clients_contact_id ON clients(contact_id);
CREATE INDEX idx_policies_policy_id ON policies(policy_id);
CREATE INDEX idx_policies_contact_id ON policies(contact_id);
CREATE INDEX idx_renewals_policy_id ON renewals(policy_id);
CREATE INDEX idx_renewals_renewal_id ON renewals(renewal_id);
CREATE INDEX idx_policy_renewals_policy_id ON policy_renewals(policy_id);
CREATE INDEX idx_policy_renewals_renewal_id ON policy_renewals(renewal_id);

-- Grant necessary permissions
GRANT ALL ON contacts TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON policies TO authenticated;
GRANT ALL ON renewals TO authenticated;
GRANT ALL ON policy_renewals TO authenticated;

-- Enable RLS (Row Level Security) if needed
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_renewals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON policies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON renewals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON policy_renewals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
