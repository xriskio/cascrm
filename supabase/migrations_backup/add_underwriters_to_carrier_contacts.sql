-- Add underwriters JSON column to carrier_contacts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'carrier_contacts' 
    AND column_name = 'underwriters'
  ) THEN
    ALTER TABLE carrier_contacts ADD COLUMN underwriters JSONB;
  END IF;
END
$$;

-- Update existing records to populate the underwriters array from individual fields
UPDATE carrier_contacts
SET underwriters = jsonb_build_array(
  jsonb_build_object(
    'name', underwriter_contact,
    'phone', underwriter_number,
    'email', underwriter_email
  )
)
WHERE underwriter_contact IS NOT NULL 
  AND underwriters IS NULL;
