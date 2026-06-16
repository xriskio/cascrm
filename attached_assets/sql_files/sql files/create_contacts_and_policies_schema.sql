-- Create contacts table with comprehensive personal information
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dob date NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  mailing_address text NOT NULL,
  mailing_city text NOT NULL,
  mailing_state text NOT NULL,
  mailing_zip text NOT NULL,
  mailing_country text NOT NULL DEFAULT 'USA',
  ssn_last4 text,
  occupation text,
  years_at_residence integer DEFAULT 0,
  marital_status text,
  gender text,
  preferred_language text DEFAULT 'English',
  residency_type text,
  business_owner boolean DEFAULT false,
  industry text,
  driver_license_number text,
  driver_license_state text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create policies table with support for multiple lines of business
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  line_of_business text NOT NULL,
  subline text,
  policy_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'Quoted',
  effective_date date NOT NULL,
  expiration_date date NOT NULL,
  writing_carrier text NOT NULL,
  billing_type text NOT NULL DEFAULT 'Direct Bill',
  payment_frequency text NOT NULL DEFAULT 'Monthly',
  premium_amount numeric(12,2) DEFAULT 0,
  
  -- Homeowners specific fields
  dwelling_limit numeric(12,2),
  other_structures_limit numeric(12,2),
  personal_property_limit numeric(12,2),
  loss_of_use_limit numeric(12,2),
  liability_limit numeric(12,2),
  medical_payments_limit numeric(12,2),
  deductible numeric(12,2),
  construction_type text,
  year_built integer,
  square_footage integer,
  
  -- Auto specific fields (nullable for non-auto policies)
  bodily_injury_per_person numeric(12,2),
  bodily_injury_per_accident numeric(12,2),
  property_damage_limit numeric(12,2),
  uninsured_motorist_limit numeric(12,2),
  comprehensive_deductible numeric(12,2),
  collision_deductible numeric(12,2),
  
  -- General fields for additional data
  coverages jsonb DEFAULT '{}',
  underwriting_info jsonb DEFAULT '{}',
  notes text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create vehicles table for auto policies
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES public.policies(id) ON DELETE CASCADE,
  year integer NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  vin text UNIQUE,
  use_type text DEFAULT 'Pleasure',
  garaging_zip text,
  ownership_status text DEFAULT 'Owned',
  safety_features jsonb DEFAULT '{}',
  coverages jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create drivers table for auto policies
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dob date NOT NULL,
  gender text,
  marital_status text,
  relationship text DEFAULT 'Self',
  license_number text,
  license_state text,
  license_type text DEFAULT 'Full',
  years_licensed integer,
  violations jsonb DEFAULT '[]',
  accidents jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now()
);

-- Create customer_addresses table for multiple addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  address_type text DEFAULT 'Mailing',
  street_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text DEFAULT 'USA',
  is_primary boolean DEFAULT false,
  years_at_address integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can view all contacts') THEN
        CREATE POLICY "Users can view all contacts" ON public.contacts FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can insert contacts') THEN
        CREATE POLICY "Users can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can update contacts') THEN
        CREATE POLICY "Users can update contacts" ON public.contacts FOR UPDATE USING (true);
    END IF;
END $$;

-- Create RLS policies for policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can view all policies') THEN
        CREATE POLICY "Users can view all policies" ON public.policies FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can insert policies') THEN
        CREATE POLICY "Users can insert policies" ON public.policies FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can update policies') THEN
        CREATE POLICY "Users can update policies" ON public.policies FOR UPDATE USING (true);
    END IF;
END $$;

-- Create RLS policies for vehicles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can manage vehicles') THEN
        CREATE POLICY "Users can manage vehicles" ON public.vehicles FOR ALL USING (true);
    END IF;
END $$;

-- Create RLS policies for drivers
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'Users can manage drivers') THEN
        CREATE POLICY "Users can manage drivers" ON public.drivers FOR ALL USING (true);
    END IF;
END $$;

-- Create RLS policies for customer_addresses
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'customer_addresses' AND policyname = 'Users can manage addresses') THEN
        CREATE POLICY "Users can manage addresses" ON public.customer_addresses FOR ALL USING (true);
    END IF;
END $$;

-- Grant access to authenticated users and service role
GRANT ALL ON public.contacts TO authenticated, service_role;
GRANT ALL ON public.policies TO authenticated, service_role;
GRANT ALL ON public.vehicles TO authenticated, service_role;
GRANT ALL ON public.drivers TO authenticated, service_role;
GRANT ALL ON public.customer_addresses TO authenticated, service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_policies_contact_id ON public.policies(contact_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON public.policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_status ON public.policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_line_of_business ON public.policies(line_of_business);
CREATE INDEX IF NOT EXISTS idx_vehicles_contact_id ON public.vehicles(contact_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_policy_id ON public.vehicles(policy_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON public.vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_drivers_contact_id ON public.drivers(contact_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_contact_id ON public.customer_addresses(contact_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policies_updated_at ON public.policies;
CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON public.policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.contacts (
  first_name, last_name, dob, email, phone,
  mailing_address, mailing_city, mailing_state, mailing_zip, mailing_country,
  ssn_last4, occupation, years_at_residence, marital_status, gender
) VALUES 
(
  'John', 'Smith', '1985-06-15', 'john.smith@example.com', '555-123-4567',
  '123 Main St', 'Anytown', 'CA', '90210', 'USA',
  '1234', 'Software Engineer', 5, 'Married', 'Male'
),
(
  'Jane', 'Doe', '1990-03-22', 'jane.doe@example.com', '555-987-6543',
  '456 Oak Ave', 'Springfield', 'IL', '62701', 'USA',
  '5678', 'Teacher', 3, 'Single', 'Female'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample policies
DO $$
DECLARE
    john_id uuid;
    jane_id uuid;
BEGIN
    -- Get contact IDs
    SELECT id INTO john_id FROM public.contacts WHERE email = 'john.smith@example.com';
    SELECT id INTO jane_id FROM public.contacts WHERE email = 'jane.doe@example.com';
    
    -- Insert sample homeowners policy for John
    IF john_id IS NOT NULL THEN
        INSERT INTO public.policies (
            contact_id, line_of_business, subline, policy_number, status,
            effective_date, expiration_date, writing_carrier, billing_type, payment_frequency,
            dwelling_limit, other_structures_limit, personal_property_limit, loss_of_use_limit,
            liability_limit, medical_payments_limit, deductible, construction_type, year_built, square_footage
        ) VALUES (
            john_id, 'Homeowners', 'HO-3', 'HO-2024-001', 'Active',
            '2024-01-01', '2025-01-01', 'State Farm', 'Direct Bill', 'Monthly',
            350000, 35000, 175000, 70000, 300000, 5000, 1000, 'Frame', 1995, 2200
        ) ON CONFLICT (policy_number) DO NOTHING;
    END IF;
    
    -- Insert sample auto policy for Jane
    IF jane_id IS NOT NULL THEN
        INSERT INTO public.policies (
            contact_id, line_of_business, subline, policy_number, status,
            effective_date, expiration_date, writing_carrier, billing_type, payment_frequency,
            bodily_injury_per_person, bodily_injury_per_accident, property_damage_limit,
            uninsured_motorist_limit, comprehensive_deductible, collision_deductible
        ) VALUES (
            jane_id, 'Auto', 'Personal Auto', 'AUTO-2024-001', 'Active',
            '2024-01-01', '2025-01-01', 'Allstate', 'Direct Bill', 'Monthly',
            100000, 300000, 100000, 100000, 500, 1000
        ) ON CONFLICT (policy_number) DO NOTHING;
    END IF;
END $$;
