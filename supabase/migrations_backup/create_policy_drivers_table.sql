-- Create policy_drivers table if it doesn't exist
CREATE TABLE IF NOT EXISTS policy_drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qq_driver_id INTEGER,
  policy_detail_id INTEGER,
  driver_number INTEGER,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  date_of_birth TEXT,
  drivers_license_number TEXT,
  state_licensed TEXT,
  year_licensed INTEGER,
  years_experience INTEGER,
  ssn TEXT,
  marital_status_id INTEGER,
  date_hired TEXT,
  gender TEXT,
  city TEXT,
  state_code TEXT,
  zip_code TEXT,
  vehicle_id INTEGER,
  percent_use DECIMAL,
  carrier_driver_number INTEGER,
  agency_driver_code TEXT,
  excluded BOOLEAN DEFAULT FALSE,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policy_drivers_qq_driver_id ON policy_drivers(qq_driver_id);
CREATE INDEX IF NOT EXISTS idx_policy_drivers_policy_detail_id ON policy_drivers(policy_detail_id);

-- Add RLS policies

-- Create policy for authenticated users
