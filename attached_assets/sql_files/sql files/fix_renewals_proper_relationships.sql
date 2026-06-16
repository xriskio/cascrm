-- Fix the renewals table to have proper relationships with clients and policies
DO $$ 
BEGIN
    -- Create clients table if it doesn't exist
    CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_name TEXT,
        business_name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create policies table if it doesn't exist
    CREATE TABLE IF NOT EXISTS policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        policy_number TEXT UNIQUE,
        policy_type TEXT,
        line_of_business TEXT,
        carrier TEXT,
        effective_date DATE,
        expiration_date DATE,
        premium DECIMAL(12,2),
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add proper foreign keys to renewals table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE renewals ADD COLUMN client_id UUID REFERENCES clients(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'policy_id'
    ) THEN
        ALTER TABLE renewals ADD COLUMN policy_id UUID REFERENCES policies(id);
    END IF;

    -- Add assigned_agent_id for workflow management
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'assigned_agent_id'
    ) THEN
        ALTER TABLE renewals ADD COLUMN assigned_agent_id UUID REFERENCES profiles(id);
    END IF;

    -- Add other necessary columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE renewals ADD COLUMN tracking_number TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'archived'
    ) THEN
        ALTER TABLE renewals ADD COLUMN archived BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'status'
    ) THEN
        ALTER TABLE renewals ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Insert sample clients if none exist
INSERT INTO clients (id, client_name, business_name, email, phone)
SELECT 
    gen_random_uuid(),
    'Sample Client',
    'Sample Business LLC',
    'client@example.com',
    '555-0123'
WHERE NOT EXISTS (SELECT 1 FROM clients LIMIT 1);

-- Insert sample policies if none exist
INSERT INTO policies (id, client_id, policy_number, policy_type, line_of_business, carrier, effective_date, expiration_date, premium)
SELECT 
    gen_random_uuid(),
    c.id,
    'POL-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
    'Commercial Auto',
    'Commercial Auto',
    'Sample Insurance Co',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    5000.00
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM policies LIMIT 1)
LIMIT 1;

-- Create some sample renewals with proper relationships
INSERT INTO renewals (
    id,
    client_id,
    policy_id,
    tracking_number,
    client_name,
    business_name,
    policy_number,
    line_of_business,
    writing_carrier,
    expiration_date,
    policy_premium,
    status,
    archived,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    c.id,
    p.id,
    'REN-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
    c.client_name,
    c.business_name,
    p.policy_number,
    p.line_of_business,
    p.carrier,
    p.expiration_date,
    p.premium,
    'pending',
    FALSE,
    NOW(),
    NOW()
FROM clients c
JOIN policies p ON p.client_id = c.id
WHERE NOT EXISTS (SELECT 1 FROM renewals WHERE client_id = c.id AND policy_id = p.id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
DROP POLICY IF EXISTS "Enable all operations for clients" ON clients;
CREATE POLICY "Enable all operations for clients" ON clients FOR ALL USING (true);

-- Create policies for policies table
DROP POLICY IF EXISTS "Enable all operations for policies" ON policies;
CREATE POLICY "Enable all operations for policies" ON policies FOR ALL USING (true);

-- Create policies for renewals
DROP POLICY IF EXISTS "Enable all operations for renewals" ON renewals;
CREATE POLICY "Enable all operations for renewals" ON renewals FOR ALL USING (true);
