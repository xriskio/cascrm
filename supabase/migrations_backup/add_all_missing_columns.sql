-- Comprehensive migration to add all missing columns and relationships
-- This migration is safe to run multiple times (idempotent)

-- 1. Add missing columns to customers table
DO $$
BEGIN
    -- Add co-applicant fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'co_applicant_dob') THEN
        ALTER TABLE customers ADD COLUMN co_applicant_dob DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'co_applicant_first_name') THEN
        ALTER TABLE customers ADD COLUMN co_applicant_first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'co_applicant_middle_name') THEN
        ALTER TABLE customers ADD COLUMN co_applicant_middle_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'co_applicant_last_name') THEN
        ALTER TABLE customers ADD COLUMN co_applicant_last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'co_applicant_ssn_last_four') THEN
        ALTER TABLE customers ADD COLUMN co_applicant_ssn_last_four TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'co_applicant_email') THEN
        ALTER TABLE customers ADD COLUMN co_applicant_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'co_applicant_phone') THEN
        ALTER TABLE customers ADD COLUMN co_applicant_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'relationship_to_primary') THEN
        ALTER TABLE customers ADD COLUMN relationship_to_primary TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'has_co_applicant') THEN
        ALTER TABLE customers ADD COLUMN has_co_applicant BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Ensure profiles table exists with all required columns
DO $$
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            role TEXT DEFAULT 'agent',
            department TEXT,
            manager_id UUID,
            is_active BOOLEAN DEFAULT TRUE,
            avatar_url TEXT,
            bio TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        -- Add foreign key constraint for manager_id after table creation
        ALTER TABLE profiles ADD CONSTRAINT profiles_manager_id_fkey 
        FOREIGN KEY (manager_id) REFERENCES profiles(id) ON DELETE SET NULL;
        
        -- Enable RLS
        
        -- Create RLS policies
            
            
            
    ELSE
        -- Add missing columns to existing profiles table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department') THEN
            ALTER TABLE profiles ADD COLUMN department TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'manager_id') THEN
            ALTER TABLE profiles ADD COLUMN manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
            ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
            ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
            ALTER TABLE profiles ADD COLUMN bio TEXT;
        END IF;
    END IF;
END $$;

-- 3. Add profile_id to renewals table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'renewals' AND column_name = 'profile_id') THEN
        ALTER TABLE renewals ADD COLUMN profile_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE renewals ADD CONSTRAINT renewals_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Add missing columns to quotes table
DO $$
BEGIN
    -- Create quotes table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
        CREATE TABLE quotes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quote_number TEXT UNIQUE NOT NULL,
            user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
            profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            contact_name TEXT NOT NULL,
            contact_email TEXT,
            contact_phone TEXT,
            insured_name TEXT NOT NULL,
            policy_type TEXT NOT NULL,
            effective_date DATE,
            expiration_date DATE,
            premium_amount DECIMAL(10,2),
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Disable RLS for development
        ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
    ELSE
        -- Add missing columns to existing quotes table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'profile_id') THEN
            ALTER TABLE quotes ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'user_id') THEN
            ALTER TABLE quotes ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
        END IF;
    END IF;
END $$;

-- 5. Add missing columns to submissions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'has_missing_documents') THEN
        ALTER TABLE submissions ADD COLUMN has_missing_documents BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'profile_id') THEN
        ALTER TABLE submissions ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Add missing columns to tasks table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'profile_id') THEN
        ALTER TABLE tasks ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. Add missing columns to incoming_calls table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incoming_calls' AND column_name = 'profile_id') THEN
        ALTER TABLE incoming_calls ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 8. Add missing columns to service_requests table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'profile_id') THEN
        ALTER TABLE service_requests ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 9. Create all necessary indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_co_applicant_dob ON customers(co_applicant_dob);
CREATE INDEX IF NOT EXISTS idx_customers_has_co_applicant ON customers(has_co_applicant);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_renewals_profile_id ON renewals(profile_id);
CREATE INDEX IF NOT EXISTS idx_quotes_profile_id ON quotes(profile_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_submissions_profile_id ON submissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_submissions_has_missing_documents ON submissions(has_missing_documents);
CREATE INDEX IF NOT EXISTS idx_tasks_profile_id ON tasks(profile_id);
CREATE INDEX IF NOT EXISTS idx_incoming_calls_profile_id ON incoming_calls(profile_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_profile_id ON service_requests(profile_id);

-- 10. Update existing data to establish relationships where possible
UPDATE renewals 
SET profile_id = profiles.id 
FROM profiles 
WHERE renewals.user_id = profiles.user_id 
AND renewals.profile_id IS NULL;

UPDATE quotes 
SET profile_id = profiles.id 
FROM profiles 
WHERE quotes.user_id = profiles.user_id 
AND quotes.profile_id IS NULL;

UPDATE submissions 
SET profile_id = profiles.id 
FROM profiles 
WHERE submissions.user_id = profiles.user_id 
AND submissions.profile_id IS NULL;

UPDATE tasks 
SET profile_id = profiles.id 
FROM profiles 
WHERE tasks.user_id = profiles.user_id 
AND tasks.profile_id IS NULL;

-- 11. Add helpful comments for documentation
COMMENT ON TABLE customers IS 'Customer information including co-applicant details';
COMMENT ON TABLE profiles IS 'User profiles with role-based access control and organizational hierarchy';
COMMENT ON TABLE quotes IS 'Insurance quotes with user and profile relationships';

COMMENT ON COLUMN customers.co_applicant_dob IS 'Co-applicant date of birth';
COMMENT ON COLUMN customers.has_co_applicant IS 'Flag indicating if customer has a co-applicant';
COMMENT ON COLUMN profiles.manager_id IS 'Reference to manager profile for organizational hierarchy';
COMMENT ON COLUMN renewals.profile_id IS 'Reference to the user profile who owns this renewal';
COMMENT ON COLUMN quotes.profile_id IS 'Reference to the user profile who created this quote';
COMMENT ON COLUMN submissions.has_missing_documents IS 'Flag indicating if submission has missing required documents';
