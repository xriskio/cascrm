-- Check if the file_url column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agency_resources'
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE public.agency_resources ADD COLUMN file_url TEXT;
    END IF;
END $$;

-- Disable RLS for agency_resources table
ALTER TABLE public.agency_resources DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to authenticated users
GRANT ALL ON public.agency_resources TO PUBLIC;
GRANT ALL ON public.agency_resources TO service_role;
