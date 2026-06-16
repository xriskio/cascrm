-- This migration aligns our code with the actual schema in Supabase
-- and updates the underwriters column to support lines of business

-- First, check if underwriters column exists and is a text array
DO $$
BEGIN
  -- Check if underwriters column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'carrier_contacts' 
    AND column_name = 'underwriters'
  ) THEN
    -- Check if it's a text array and convert to JSONB if needed
    IF (
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'carrier_contacts' 
      AND column_name = 'underwriters'
    ) = 'ARRAY' THEN
      -- Drop the text[] column and create a JSONB column
      ALTER TABLE carrier_contacts DROP COLUMN underwriters;
      ALTER TABLE carrier_contacts ADD COLUMN underwriters JSONB;
    END IF;
  ELSE
    -- If column doesn't exist, add it as JSONB
    ALTER TABLE carrier_contacts ADD COLUMN underwriters JSONB;
  END IF;
END $$;

-- Create a function to convert existing underwriter data to the new format
CREATE OR REPLACE FUNCTION migrate_underwriter_data() RETURNS void AS $$
BEGIN
  -- Update records that have underwriter info but no underwriters JSONB
  UPDATE carrier_contacts
  SET underwriters = jsonb_build_array(
    jsonb_build_object(
      'name', underwriter_contact,
      'phone', underwriter_number,
      'email', underwriter_email,
      'lines_of_business', '[]'::jsonb
    )
  )
  WHERE (underwriter_contact IS NOT NULL OR underwriter_name IS NOT NULL) 
    AND (underwriters IS NULL OR jsonb_array_length(underwriters) = 0);
  
  -- Also migrate data from underwriter_name, underwriter_email, underwriter_phone if they exist
  UPDATE carrier_contacts
  SET underwriters = jsonb_build_array(
    jsonb_build_object(
      'name', underwriter_name,
      'phone', underwriter_phone,
      'email', underwriter_email,
      'lines_of_business', '[]'::jsonb
    )
  )
  WHERE underwriter_name IS NOT NULL 
    AND (underwriters IS NULL OR jsonb_array_length(underwriters) = 0);
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT migrate_underwriter_data();

-- Drop the function after use
DROP FUNCTION migrate_underwriter_data();

-- Add index for better performance if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'carrier_contacts' 
    AND indexname = 'idx_carrier_contacts_insurance_carrier'
  ) THEN
    CREATE INDEX idx_carrier_contacts_insurance_carrier ON carrier_contacts(insurance_carrier);
  END IF;
END $$;
