-- Create policies table if it doesn't exist
CREATE TABLE IF NOT EXISTS policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL,
    policy_number TEXT UNIQUE NOT NULL,
    carrier TEXT,
    effective_date DATE,
    expiration_date DATE,
    premium DECIMAL(12, 2),
    coverage_limits TEXT,
    deductible DECIMAL(10, 2),
    policy_line TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on policies table
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Grant access to authenticated users
GRANT ALL ON policies TO authenticated;
GRANT ALL ON policies TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_carrier ON policies(carrier);
CREATE INDEX IF NOT EXISTS idx_policies_effective_date ON policies(effective_date);
CREATE INDEX IF NOT EXISTS idx_policies_expiration_date ON policies(expiration_date);
