-- ================================================================================
-- COMPLETE PRODUCTION DATABASE SETUP
-- ================================================================================
-- Run this ENTIRE script in your PRODUCTION Supabase SQL Editor
-- This will create EVERYTHING needed for deployment to succeed
-- ================================================================================

-- Step 1: Create the authenticated role (required for Row Level Security)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
    RAISE NOTICE 'Created authenticated role';
  ELSE
    RAISE NOTICE 'Authenticated role already exists';
  END IF;
END $$;

-- Step 2: Enable pgcrypto extension (for tracking number generation)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 3: Verify the role was created
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    RAISE NOTICE '✅ Authenticated role verified';
  ELSE
    RAISE EXCEPTION '❌ Authenticated role was not created!';
  END IF;
END $$;

-- Done! You should see success messages above
SELECT '✅ Production database is ready for deployment!' AS status;
