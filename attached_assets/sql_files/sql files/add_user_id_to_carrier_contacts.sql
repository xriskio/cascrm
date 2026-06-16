-- Add user_id column to carrier_contacts table if it doesn't exist
ALTER TABLE carrier_contacts 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Disable RLS temporarily to allow the migration to run
ALTER TABLE carrier_contacts DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow full access to authenticated users"
ON carrier_contacts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a policy that allows all operations for the service role
CREATE POLICY "Allow full access to service role"
ON carrier_contacts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Enable RLS again
ALTER TABLE carrier_contacts ENABLE ROW LEVEL SECURITY;
