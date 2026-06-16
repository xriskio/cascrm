-- Comprehensive schema validation and creation script
-- This ensures all required tables and relationships exist

-- 1. Ensure customers table has all required fields
DO $$
BEGIN
    -- Check if customers table exists
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
            co_applicant_first_name TEXT,
            co_applicant_middle_name TEXT,
            co_applicant_last_name TEXT,
            co_applicant_dob DATE,
            co_applicant_ssn_last_four TEXT,
            co_applicant_email TEXT,
            co_applicant_phone TEXT,
            relationship_to_primary TEXT,
            has_co_applicant BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Add missing columns if they don't exist
        ALTER TABLE customers 
        ADD COLUMN IF NOT EXISTS co_applicant_dob DATE,
        ADD COLUMN IF NOT EXISTS co_applicant_first_name TEXT,
        ADD COLUMN IF NOT EXISTS co_applicant_middle_name TEXT,
        ADD COLUMN IF NOT EXISTS co_applicant_last_name TEXT,
        ADD COLUMN IF NOT EXISTS co_applicant_ssn_last_four TEXT,
        ADD COLUMN IF NOT EXISTS co_applicant_email TEXT,
        ADD COLUMN IF NOT EXISTS co_applicant_phone TEXT,
        ADD COLUMN IF NOT EXISTS relationship_to_primary TEXT,
        ADD COLUMN IF NOT EXISTS has_co_applicant BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Ensure profiles table exists with proper structure
DO $$
BEGIN
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
            manager_id UUID REFERENCES profiles(id),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        -- Enable RLS
        
        -- Create RLS policies
            
            
            
    END IF;
END $$;

-- 3. Ensure renewals table has proper relationships
DO $$
BEGIN
    -- Add profile_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE renewals ADD COLUMN profile_id UUID;
    END IF;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'renewals_profile_id_fkey' 
        AND table_name = 'renewals'
    ) THEN
        ALTER TABLE renewals 
        ADD CONSTRAINT renewals_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_customers_co_applicant_dob ON customers(co_applicant_dob);
CREATE INDEX IF NOT EXISTS idx_customers_has_co_applicant ON customers(has_co_applicant);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_renewals_profile_id ON renewals(profile_id);

-- 5. Update existing data to establish relationships
UPDATE renewals 
SET profile_id = profiles.id 
FROM profiles 
WHERE renewals.user_id = profiles.user_id 
AND renewals.profile_id IS NULL;

-- 6. Add helpful comments
COMMENT ON TABLE customers IS 'Customer information including co-applicant details';
COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN customers.co_applicant_dob IS 'Co-applicant date of birth';
COMMENT ON COLUMN renewals.profile_id IS 'Reference to the user profile who owns this renewal';
