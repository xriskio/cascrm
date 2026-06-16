-- Add lines_of_business to underwriters JSON structure
-- This migration is safe to run multiple times as it doesn't modify existing data

-- First, check if we need to update the underwriters column
DO $$
BEGIN
  -- If the column doesn't exist, we don't need to do anything
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'carrier_contacts' 
    AND column_name = 'underwriters'
  ) THEN
    -- Update existing underwriters to add lines_of_business if they don't have it
    UPDATE carrier_contacts
    SET underwriters = (
      SELECT jsonb_agg(
        CASE
          WHEN jsonb_typeof(uw) = 'object' AND NOT (uw ? 'lines_of_business') 
          THEN jsonb_set(uw, '{lines_of_business}', '[]'::jsonb)
          ELSE uw
        END
      )
      FROM jsonb_array_elements(underwriters) AS uw
    )
    WHERE underwriters IS NOT NULL AND jsonb_typeof(underwriters) = 'array';
  END IF;
END $$;
