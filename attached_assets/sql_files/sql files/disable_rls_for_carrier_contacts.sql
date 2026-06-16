-- Disable Row Level Security on the carrier_contacts table
ALTER TABLE carrier_contacts DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON carrier_contacts;
DROP POLICY IF EXISTS "Allow all operations for all users" ON carrier_contacts;
