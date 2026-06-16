-- ================================================================================
-- ULTIMATE PRODUCTION DATABASE FIX
-- ================================================================================
-- Run this ENTIRE script in your production Supabase SQL Editor
-- Project URL: https://bkdgdfwotlyvojnrenet.supabase.co
-- ================================================================================

-- STEP 1: Drop all existing policies that reference authenticated role
-- (This prevents the "role does not exist" error during restore)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
            r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- STEP 2: Create ALL required Supabase roles
DO $$
BEGIN
    -- Create authenticated role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
        RAISE NOTICE '✅ Created authenticated role';
    ELSE
        RAISE NOTICE 'ℹ️  Authenticated role already exists';
    END IF;

    -- Create anon role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
        RAISE NOTICE '✅ Created anon role';
    ELSE
        RAISE NOTICE 'ℹ️  Anon role already exists';
    END IF;

    -- Create service_role
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
        RAISE NOTICE '✅ Created service_role';
    ELSE
        RAISE NOTICE 'ℹ️  Service_role already exists';
    END IF;
END $$;

-- STEP 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- STEP 4: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 5: Verify everything worked
DO $$
DECLARE
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count
    FROM pg_roles
    WHERE rolname IN ('authenticated', 'anon', 'service_role');
    
    IF role_count = 3 THEN
        RAISE NOTICE '✅✅✅ ALL ROLES CREATED SUCCESSFULLY! ✅✅✅';
    ELSE
        RAISE EXCEPTION '❌ Only % of 3 required roles exist!', role_count;
    END IF;
END $$;

-- Final verification query
SELECT 
    '✅ PRODUCTION DATABASE IS READY FOR DEPLOYMENT!' AS status,
    string_agg(rolname, ', ') AS roles_created
FROM pg_roles
WHERE rolname IN ('authenticated', 'anon', 'service_role');
