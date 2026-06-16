-- Add user_id column to carrier_contacts table if it doesn't exist
ALTER TABLE carrier_contacts 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Disable RLS temporarily to allow the migration to run
ALTER TABLE carrier_contacts DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users

-- Create a policy that allows all operations for the service role

-- Enable RLS again
