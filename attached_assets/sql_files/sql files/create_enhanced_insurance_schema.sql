-- Create enhanced insurance schema with all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_number text UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dob date,
  email text NOT NULL,
  phone text NOT NULL,
  mailing_address text NOT NULL,
  mailing_city text NOT NULL,
  mailing_state text NOT NULL,
  mailing_zip text NOT NULL,
  mailing_country text DEFAULT 'USA',
  ssn_last4 text,
  occupation text,
  years_at_residence integer,
  marital_status text,
  gender text,
  license_number text,
  license_state text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create policies table
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  policy_number text NOT NULL,
  line_of_business text NOT NULL, -- 'home', 'auto', 'boat', 'motorcycle', etc.
  subline text,
  status text NOT NULL DEFAULT 'active',
  effective_date date NOT NULL,
  expiration_date date NOT NULL,
  writing_carrier text NOT NULL,
  billing_type text NOT NULL,
  payment_frequency text NOT NULL,
  
  -- Home Insurance Fields
  dwelling_limit numeric,
  other_structures_limit numeric,
  personal_property_limit numeric,
  loss_of_use_limit numeric,
  liability_limit numeric,
  medical_payments_limit numeric,
  deductible numeric,
  construction_type text,
  year_built integer,
  square_footage integer,
  property_address text,
  property_city text,
  property_state text,
  property_zip text,
  
  -- Auto Insurance Fields
  bodily_injury_limit text,
  property_damage_limit text,
  uninsured_motorist_limit text,
  comprehensive_deductible numeric,
  collision_deductible numeric,
  
  -- Common Fields
  premium_amount numeric,
  commission_rate numeric,
  commission_amount numeric,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create vehicles table for auto policies
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid REFERENCES public.policies(id) ON DELETE CASCADE,
  vin text,
  year integer NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  body_style text,
  use_type text, -- 'pleasure', 'commute', 'business', etc.
  annual_mileage integer,
  garaging_address text,
  garaging_city text,
  garaging_state text,
  garaging_zip text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create drivers table for auto policies
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid REFERENCES public.policies(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id),
  relationship text, -- 'named_insured', 'spouse', 'child', etc.
  license_number text,
  license_state text,
  license_status text,
  date_licensed date,
  good_student boolean DEFAULT false,
  defensive_driving boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create customer_addresses table for multiple addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  address_type text NOT NULL, -- 'mailing', 'property', 'garaging', etc.
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text DEFAULT 'USA',
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create function to check if table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_customer_number ON public.contacts(customer_number);
CREATE INDEX IF NOT EXISTS idx_policies_contact_id ON public.policies(contact_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON public.policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_policy_id ON public.vehicles(policy_id);
CREATE INDEX IF NOT EXISTS idx_drivers_policy_id ON public.drivers(policy_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_contact_id ON public.customer_addresses(contact_id);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users for now)
CREATE POLICY "Allow all operations for authenticated users" ON public.contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.policies
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.vehicles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.drivers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON public.customer_addresses
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
