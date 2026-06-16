-- ================================================================================
-- PRODUCTION DATABASE FUNCTIONS - MISSING RPC FUNCTIONS
-- ================================================================================
-- Run this in your PRODUCTION Supabase SQL Editor to fix the missing functions
-- ================================================================================

-- Enable pgcrypto extension for secure random generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function 1: Generate unique client numbers (CLI-{timestamp}-{random})
CREATE OR REPLACE FUNCTION public.generate_client_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
BEGIN
  LOOP
    candidate := 'CLI-' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '-' ||
                 upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM clients WHERE client_number = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Function 2: Generate unique contact numbers (CON-{timestamp}-{random})
CREATE OR REPLACE FUNCTION public.generate_contact_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
BEGIN
  LOOP
    candidate := 'CON-' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '-' ||
                 upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM contacts WHERE contact_number = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Function 3: Generate unique renewal numbers (RNW-{timestamp}-{random})
CREATE OR REPLACE FUNCTION public.generate_renewal_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
BEGIN
  LOOP
    candidate := 'RNW-' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '-' ||
                 upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM renewals WHERE renewal_number = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Function 4: Generate unique quote numbers (QTE-{timestamp}-{random})
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
BEGIN
  LOOP
    candidate := 'QTE-' || to_char(NOW(), 'YYYYMMDDHH24MISS') || '-' ||
                 upper(substr(md5(gen_random_uuid()::text), 1, 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM submissions WHERE quote_number = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

-- Verify functions were created
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'generate_%'
ORDER BY routine_name;

-- Expected output:
-- generate_client_number   | FUNCTION
-- generate_contact_number  | FUNCTION
-- generate_quote_number    | FUNCTION
-- generate_renewal_number  | FUNCTION

SELECT '✅ All tracking number generation functions created successfully!' AS status;
