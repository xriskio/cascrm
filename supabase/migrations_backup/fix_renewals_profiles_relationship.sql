-- Add profile_id column to renewals table if it doesn't exist
ALTER TABLE renewals 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);

-- Add user_id column to renewals table if it doesn't exist (for backward compatibility)
ALTER TABLE renewals 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_renewals_profile_id ON renewals(profile_id);
CREATE INDEX IF NOT EXISTS idx_renewals_user_id ON renewals(user_id);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'renewals_profile_id_fkey' 
        AND table_name = 'renewals'
    ) THEN
        ALTER TABLE renewals 
        ADD CONSTRAINT renewals_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing renewals to link with profiles where possible
UPDATE renewals 
SET profile_id = profiles.id 
FROM profiles 
WHERE renewals.user_id = profiles.user_id 
AND renewals.profile_id IS NULL;

-- Add comments
COMMENT ON COLUMN renewals.profile_id IS 'Reference to the user profile';
COMMENT ON COLUMN renewals.user_id IS 'Reference to the auth user (for backward compatibility)';
