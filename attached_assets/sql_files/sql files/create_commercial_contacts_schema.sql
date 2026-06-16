-- Create commercial_contacts table for commercial lines customers
CREATE TABLE IF NOT EXISTS commercial_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic Information
    business_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    customer_type TEXT DEFAULT 'commercial',
    current_status TEXT DEFAULT 'active',
    contact_type TEXT DEFAULT 'customers',
    location TEXT DEFAULT 'CASURANCE AGENCY INSURANCE SERVICES',
    customer_number TEXT UNIQUE,
    
    -- Business Information
    federal_ein TEXT,
    business_entity TEXT,
    year_business_started INTEGER,
    years_in_business INTEGER,
    number_of_employees INTEGER,
    annual_revenue DECIMAL(15, 2),
    industry TEXT,
    business_description TEXT,
    website TEXT,
    
    -- Primary Contact Information
    contact_first_name TEXT,
    contact_middle_name TEXT,
    contact_last_name TEXT,
    contact_title TEXT,
    primary_phone_type TEXT,
    secondary_phone TEXT,
    secondary_phone_type TEXT,
    preferred_contact_method TEXT,
    
    -- Business Address (Mailing)
    mailing_address TEXT,
    mailing_city TEXT,
    mailing_state TEXT,
    mailing_zip TEXT,
    mailing_country TEXT DEFAULT 'USA',
    
    -- Physical Address
    same_as_mailing BOOLEAN DEFAULT true,
    physical_address TEXT,
    physical_city TEXT,
    physical_state TEXT,
    physical_zip TEXT,
    physical_country TEXT DEFAULT 'USA',
    
    -- Current Insurance Information
    current_insurance_carrier TEXT,
    years_with_current_carrier INTEGER,
    current_policy_expiration DATE,
    current_premium DECIMAL(10, 2),
    
    -- Policy Types Needed
    policy_general_liability BOOLEAN DEFAULT false,
    policy_property BOOLEAN DEFAULT false,
    policy_workers_comp BOOLEAN DEFAULT false,
    policy_professional_liability BOOLEAN DEFAULT false,
    policy_cyber BOOLEAN DEFAULT false,
    policy_umbrella BOOLEAN DEFAULT false,
    policy_commercial_auto BOOLEAN DEFAULT false,
    desired_effective_date DATE,
    
    -- Account Information
    priority TEXT DEFAULT 'Normal',
    customer_since DATE,
    agent TEXT,
    csr TEXT,
    created_by TEXT,
    customer_source TEXT,
    source_detail TEXT,
    
    -- Additional Information
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_user_id UUID,
    updated_by_user_id UUID
);

-- Enable RLS
ALTER TABLE commercial_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all commercial contacts" ON commercial_contacts FOR SELECT USING (true);
CREATE POLICY "Users can insert commercial contacts" ON commercial_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update commercial contacts" ON commercial_contacts FOR UPDATE USING (true);
CREATE POLICY "Users can delete commercial contacts" ON commercial_contacts FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON commercial_contacts TO authenticated;
GRANT ALL ON commercial_contacts TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_customer_number ON commercial_contacts(customer_number);
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_email ON commercial_contacts(email);
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_business_name ON commercial_contacts(business_name);
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_created_at ON commercial_contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_status ON commercial_contacts(current_status);

-- Create function to auto-generate customer numbers
CREATE OR REPLACE FUNCTION generate_commercial_customer_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    customer_number TEXT;
BEGIN
    -- Get the highest customer number and increment
    SELECT COALESCE(MAX(CAST(customer_number AS INTEGER)), 400000) + 1
    INTO next_number
    FROM commercial_contacts
    WHERE customer_number ~ '^[0-9]+$';
    
    customer_number := next_number::TEXT;
    
    RETURN customer_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate customer number
CREATE OR REPLACE FUNCTION set_commercial_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_commercial_customer_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_commercial_customer_number
    BEFORE INSERT ON commercial_contacts
    FOR EACH ROW
    EXECUTE FUNCTION set_commercial_customer_number();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_commercial_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_commercial_contacts_updated_at
    BEFORE UPDATE ON commercial_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_commercial_contacts_updated_at();
