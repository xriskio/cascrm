-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    federal_ein TEXT,
    business_entity TEXT,
    year_business_started INTEGER,
    number_of_employees INTEGER,
    annual_revenue DECIMAL(12, 2),
    customer_type TEXT,
    current_status TEXT,
    contact_type TEXT,
    notes TEXT,
    date_of_birth DATE,
    marital_status TEXT,
    gender TEXT,
    social_security TEXT,
    preferred_language TEXT,
    residency_type TEXT,
    business_owner BOOLEAN DEFAULT FALSE,
    industry TEXT,
    occupation TEXT,
    driver_license_number TEXT,
    driver_license_state TEXT,
    customer_number TEXT UNIQUE,
    priority TEXT DEFAULT 'Normal',
    customer_since DATE,
    agent TEXT,
    csr TEXT,
    created_by TEXT,
    location TEXT,
    customer_source TEXT,
    source_detail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can view all customers') THEN
        CREATE POLICY "Users can view all customers" ON customers FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can insert customers') THEN
        CREATE POLICY "Users can insert customers" ON customers FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can update customers') THEN
        CREATE POLICY "Users can update customers" ON customers FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can delete customers') THEN
        CREATE POLICY "Users can delete customers" ON customers FOR DELETE USING (true);
    END IF;
END $$;

-- Grant access to authenticated users
GRANT ALL ON customers TO authenticated;
GRANT ALL ON customers TO service_role;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
