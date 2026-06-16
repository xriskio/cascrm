-- Enable Row Level Security on the carrier_contacts table
ALTER TABLE carrier_contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
ON carrier_contacts
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- If you need to allow anonymous access as well (for development purposes)
-- Uncomment the following policy
CREATE POLICY "Allow all operations for all users" 
ON carrier_contacts
FOR ALL
USING (true)
WITH CHECK (true);
