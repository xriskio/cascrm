-- Validate and fix schema relationships
DO $$
BEGIN
    -- Ensure profiles table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_profiles_user_id ON profiles(user_id);
    END IF;

    -- Ensure customers table exists with all required fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        CREATE TABLE customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            date_of_birth DATE,
            ssn_last_four TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Ensure submissions table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submissions') THEN
        CREATE TABLE submissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quote_number TEXT UNIQUE,
            type TEXT NOT NULL,
            status TEXT DEFAULT 'draft',
            data JSONB DEFAULT '{}'::jsonb,
            customer_id UUID REFERENCES customers(id),
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_submissions_quote_number ON submissions(quote_number);
        CREATE INDEX idx_submissions_type ON submissions(type);
        CREATE INDEX idx_submissions_status ON submissions(status);
        CREATE INDEX idx_submissions_customer_id ON submissions(customer_id);
    END IF;

    -- Ensure renewals table exists with proper relationships
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'renewals') THEN
        CREATE TABLE renewals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            policy_number TEXT,
            customer_id UUID REFERENCES customers(id),
            profile_id UUID REFERENCES profiles(id),
            user_id UUID REFERENCES auth.users(id),
            status TEXT DEFAULT 'pending',
            effective_date DATE,
            expiration_date DATE,
            premium NUMERIC,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_renewals_policy_number ON renewals(policy_number);
        CREATE INDEX idx_renewals_customer_id ON renewals(customer_id);
        CREATE INDEX idx_renewals_profile_id ON renewals(profile_id);
        CREATE INDEX idx_renewals_status ON renewals(status);
    END IF;

    RAISE NOTICE 'Schema validation completed successfully';
END $$;
