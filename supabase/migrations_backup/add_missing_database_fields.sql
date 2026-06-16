-- Add missing co_applicant_dob field to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS co_applicant_dob DATE;

-- Add missing profile_id relationship to renewals table
ALTER TABLE renewals 
ADD COLUMN IF NOT EXISTS profile_id UUID;

-- Create foreign key constraint for renewals -> profiles relationship
DO $$
BEGIN
    -- First check if profiles table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            role TEXT DEFAULT 'agent',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS on profiles
        
        -- Create RLS policies for profiles
            
            
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_co_applicant_dob ON customers(co_applicant_dob);
CREATE INDEX IF NOT EXISTS idx_renewals_profile_id ON renewals(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Add comments for documentation
COMMENT ON COLUMN customers.co_applicant_dob IS 'Co-applicant date of birth';
COMMENT ON COLUMN renewals.profile_id IS 'Reference to the user profile who owns this renewal';

-- Update existing renewals to link with profiles where possible
-- This will try to match renewals with profiles based on user_id
UPDATE renewals 
SET profile_id = profiles.id 
FROM profiles 
WHERE renewals.user_id = profiles.user_id 
AND renewals.profile_id IS NULL;
