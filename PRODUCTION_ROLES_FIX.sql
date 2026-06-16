-- ================================================================================
-- PRODUCTION DATABASE ROLES FIX
-- ================================================================================
-- Run this as SUPERUSER in your production Supabase SQL Editor ONCE
-- Then retry your deployment
-- ================================================================================

-- Create Supabase-style roles if missing
DO $$ BEGIN
  CREATE ROLE authenticated NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE ROLE service_role NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE ROLE supabase_admin NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Grant basic schema usage
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Verify roles were created
SELECT rolname FROM pg_roles WHERE rolname IN ('authenticated', 'anon', 'service_role', 'supabase_admin');
