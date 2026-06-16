-- Update agency_resources table to match the provided schema
DO $$
BEGIN
    -- Check if we need to add resource_type column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agency_resources'
        AND column_name = 'resource_type'
    ) THEN
        ALTER TABLE public.agency_resources ADD COLUMN resource_type TEXT;
    END IF;

    -- Check if we need to add external_url column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agency_resources'
        AND column_name = 'external_url'
    ) THEN
        ALTER TABLE public.agency_resources ADD COLUMN external_url TEXT;
    END IF;

    -- Rename file_url to external_url for existing records if needed
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agency_resources'
        AND column_name = 'file_url'
    ) THEN
        -- Update existing records to use the new column names
        UPDATE public.agency_resources
        SET external_url = file_url,
            resource_type = file_type
        WHERE external_url IS NULL AND file_url IS NOT NULL;
    END IF;
END $$;
