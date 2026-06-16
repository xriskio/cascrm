-- Check if the clients table exists, if not create it
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Check if the policies table exists, if not create it
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT,
  policy_number TEXT,
  line_of_business TEXT,
  json_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if the renewals table exists, if not create it
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT,
  policy_number TEXT,
  client_name TEXT,
  insured_name TEXT,
  policy_type TEXT,
  expiration_date TIMESTAMP WITH TIME ZONE,
  effective_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  policy_premium NUMERIC,
  json_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if the contacts table exists, if not create it
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  json_raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
