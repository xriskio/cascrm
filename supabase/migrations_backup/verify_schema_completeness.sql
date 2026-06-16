-- Schema verification script to ensure all required columns exist
-- Run this after the main migration to verify everything is in place

DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    column_name TEXT;
    expected_columns RECORD;
BEGIN
    -- Define expected columns for each table
    FOR expected_columns IN
        SELECT 'customers' as tbl, 'co_applicant_dob' as col
        UNION ALL SELECT 'customers', 'co_applicant_first_name'
        UNION ALL SELECT 'customers', 'co_applicant_last_name'
        UNION ALL SELECT 'customers', 'co_applicant_email'
        UNION ALL SELECT 'customers', 'co_applicant_phone'
        UNION ALL SELECT 'customers', 'has_co_applicant'
        UNION ALL SELECT 'profiles', 'user_id'
        UNION ALL SELECT 'profiles', 'role'
        UNION ALL SELECT 'profiles', 'department'
        UNION ALL SELECT 'profiles', 'manager_id'
        UNION ALL SELECT 'profiles', 'is_active'
        UNION ALL SELECT 'renewals', 'profile_id'
        UNION ALL SELECT 'quotes', 'profile_id'
        UNION ALL SELECT 'quotes', 'user_id'
        UNION ALL SELECT 'submissions', 'profile_id'
        UNION ALL SELECT 'submissions', 'has_missing_documents'
        UNION ALL SELECT 'tasks', 'profile_id'
        UNION ALL SELECT 'incoming_calls', 'profile_id'
        UNION ALL SELECT 'service_requests', 'profile_id'
    LOOP
        -- Check if column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = expected_columns.tbl 
            AND column_name = expected_columns.col
        ) THEN
            missing_columns := array_append(missing_columns, expected_columns.tbl || '.' || expected_columns.col);
        END IF;
    END LOOP;
    
    -- Report results
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Missing columns found: %', array_to_string(missing_columns, ', ');
        RAISE EXCEPTION 'Schema migration incomplete. Missing columns detected.';
    ELSE
        RAISE NOTICE 'Schema verification complete. All required columns are present.';
    END IF;
END $$;

-- Verify foreign key constraints exist
DO $$
DECLARE
    missing_constraints TEXT[] := ARRAY[]::TEXT[];
    expected_constraint RECORD;
BEGIN
    FOR expected_constraint IN
        SELECT 'renewals_profile_id_fkey' as constraint_name, 'renewals' as table_name
        UNION ALL SELECT 'quotes_profile_id_fkey', 'quotes'
        UNION ALL SELECT 'submissions_profile_id_fkey', 'submissions'
        UNION ALL SELECT 'tasks_profile_id_fkey', 'tasks'
        UNION ALL SELECT 'incoming_calls_profile_id_fkey', 'incoming_calls'
        UNION ALL SELECT 'service_requests_profile_id_fkey', 'service_requests'
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = expected_constraint.constraint_name
            AND table_name = expected_constraint.table_name
        ) THEN
            missing_constraints := array_append(missing_constraints, expected_constraint.constraint_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_constraints, 1) > 0 THEN
        RAISE NOTICE 'Missing foreign key constraints: %', array_to_string(missing_constraints, ', ');
    ELSE
        RAISE NOTICE 'All foreign key constraints are present.';
    END IF;
END $$;

-- Display schema summary
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'profiles', 'renewals', 'quotes', 'submissions', 'tasks', 'incoming_calls', 'service_requests')
GROUP BY table_name
ORDER BY table_name;
