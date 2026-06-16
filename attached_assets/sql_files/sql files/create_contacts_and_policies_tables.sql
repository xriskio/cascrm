-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    mailing_address TEXT NOT NULL,
    mailing_city TEXT NOT NULL,
    mailing_state TEXT NOT NULL,
    mailing_zip TEXT NOT NULL,
    mailing_country TEXT NOT NULL DEFAULT 'USA',
    ssn_last4 TEXT,
    occupation TEXT,
    years_at_residence INTEGER DEFAULT 0,
    marital_status TEXT,
    gender TEXT,
    preferred_language TEXT DEFAULT 'English',
    residency_type TEXT,
    business_owner BOOLEAN DEFAULT FALSE,
    industry TEXT,
    driver_license_number TEXT,
    driver_license_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies table if it doesn't exist
CREATE TABLE IF NOT EXISTS policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    line_of_business TEXT NOT NULL,
    subline TEXT,
    policy_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'Quoted',
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    writing_carrier TEXT NOT NULL,
    billing_type TEXT NOT NULL DEFAULT 'Direct Bill',
    payment_frequency TEXT NOT NULL DEFAULT 'Monthly',
    premium_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Homeowners specific fields
    dwelling_limit DECIMAL(12, 2),
    other_structures_limit DECIMAL(12, 2),
    personal_property_limit DECIMAL(12, 2),
    loss_of_use_limit DECIMAL(12, 2),
    liability_limit DECIMAL(12, 2),
    medical_payments_limit DECIMAL(12, 2),
    deductible DECIMAL(12, 2),
    construction_type TEXT,
    year_built INTEGER,
    square_footage INTEGER,
    
    -- Auto specific fields (nullable for non-auto policies)
    bodily_injury_per_person DECIMAL(12, 2),
    bodily_injury_per_accident DECIMAL(12, 2),
    property_damage_limit DECIMAL(12, 2),
    uninsured_motorist_limit DECIMAL(12, 2),
    comprehensive_deductible DECIMAL(12, 2),
    collision_deductible DECIMAL(12, 2),
    
    -- General fields for additional data
    coverages JSONB DEFAULT '{}',
    underwriting_info JSONB DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table for auto policies
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    vin TEXT UNIQUE,
    use_type TEXT DEFAULT 'Pleasure',
    garaging_zip TEXT,
    ownership_status TEXT DEFAULT 'Owned',
    safety_features JSONB DEFAULT '{}',
    coverages JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table for auto policies
CREATE TABLE IF NOT EXISTS drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT,
    marital_status TEXT,
    relationship TEXT DEFAULT 'Self',
    license_number TEXT,
    license_state TEXT,
    license_type TEXT DEFAULT 'Full',
    years_licensed INTEGER,
    violations JSONB DEFAULT '[]',
    accidents JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_addresses table for multiple addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    address_type TEXT DEFAULT 'Mailing',
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'USA',
    is_primary BOOLEAN DEFAULT FALSE,
    years_at_address INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can view all contacts') THEN
        CREATE POLICY "Users can view all contacts" ON contacts FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can insert contacts') THEN
        CREATE POLICY "Users can insert contacts" ON contacts FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can update contacts') THEN
        CREATE POLICY "Users can update contacts" ON contacts FOR UPDATE USING (true);
    END IF;
END $$;

-- Create RLS policies for policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can view all policies') THEN
        CREATE POLICY "Users can view all policies" ON policies FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can insert policies') THEN
        CREATE POLICY "Users can insert policies" ON policies FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'policies' AND policyname = 'Users can update policies') THEN
        CREATE POLICY "Users can update policies" ON policies FOR UPDATE USING (true);
    END IF;
END $$;

-- Create RLS policies for vehicles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Users can manage vehicles') THEN
        CREATE POLICY "Users can manage vehicles" ON vehicles FOR ALL USING (true);
    END IF;
END $$;

-- Create RLS policies for drivers
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'Users can manage drivers') THEN
        CREATE POLICY "Users can manage drivers" ON drivers FOR ALL USING (true);
    END IF;
END $$;

-- Create RLS policies for customer_addresses
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'customer_addresses' AND policyname = 'Users can manage addresses') THEN
        CREATE POLICY "Users can manage addresses" ON customer_addresses FOR ALL USING (true);
    END IF;
END $$;

-- Grant access to authenticated users and service role
GRANT ALL ON contacts TO authenticated, service_role;
GRANT ALL ON policies TO authenticated, service_role;
GRANT ALL ON vehicles TO authenticated, service_role;
GRANT ALL ON drivers TO authenticated, service_role;
GRANT ALL ON customer_addresses TO authenticated, service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_policies_contact_id ON policies(contact_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_contact_id ON vehicles(contact_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_policy_id ON vehicles(policy_id);
CREATE INDEX IF NOT EXISTS idx_drivers_contact_id ON drivers(contact_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_contact_id ON customer_addresses(contact_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
