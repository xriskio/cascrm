-- Add audit fields to all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('audit_logs') -- Skip audit_logs table itself
    LOOP
        -- Add created_at if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = r.table_name 
            AND column_name = 'created_at'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now()', r.table_name);
        END IF;
        
        -- Add updated_at if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = r.table_name 
            AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()', r.table_name);
        END IF;
        
        -- Add created_by if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = r.table_name 
            AND column_name = 'created_by'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN created_by UUID', r.table_name);
        END IF;
        
        -- Add updated_by if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = r.table_name 
            AND column_name = 'updated_by'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_by UUID', r.table_name);
        END IF;
        
        RAISE NOTICE 'Added audit fields to table: %', r.table_name;
    END LOOP;
END $$;
