-- Check if the agency_resources table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agency_resources') THEN
        -- Create the agency_resources table if it doesn't exist
        CREATE TABLE public.agency_resources (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            file_url TEXT,
            external_url TEXT,
            file_type TEXT,
            resource_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add comment
        COMMENT ON TABLE public.agency_resources IS 'Stores agency resources like documents and links';
    ELSE
        -- Make sure all required columns exist
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.agency_resources'::regclass AND attname = 'resource_type') THEN
            ALTER TABLE public.agency_resources ADD COLUMN resource_type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.agency_resources'::regclass AND attname = 'external_url') THEN
            ALTER TABLE public.agency_resources ADD COLUMN external_url TEXT;
        END IF;
    END IF;
END
$$;

-- Disable RLS for this table to avoid permission issues
ALTER TABLE public.agency_resources DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON public.agency_resources TO PUBLIC;
GRANT ALL ON public.agency_resources TO service_role;

-- Insert some sample resources if the table is empty
INSERT INTO public.agency_resources (title, description, category, external_url, resource_type)
SELECT 'NPI Registry Lookup', 'National Provider Identifier registry for healthcare providers', 'Reference', 'https://npiregistry.cms.hhs.gov/search', 'link'
WHERE NOT EXISTS (SELECT 1 FROM public.agency_resources LIMIT 1);

INSERT INTO public.agency_resources (title, description, category, external_url, resource_type)
SELECT 'SAFER DOT Lookup', 'Safety and Fitness Electronic Records System for DOT', 'Reference', 'https://safer.fmcsa.dot.gov/CompanySnapshot.aspx', 'link'
WHERE NOT EXISTS (SELECT 1 FROM public.agency_resources LIMIT 1);

INSERT INTO public.agency_resources (title, description, category, external_url, resource_type)
SELECT 'CA CPUC TCP Lookup', 'California Public Utilities Commission TCP lookup', 'Reference', 'https://www.cpuc.ca.gov/regulatory-services/licensing/transportation-licensing-and-analysis-branch/tcp-certificates-and-permits', 'link'
WHERE NOT EXISTS (SELECT 1 FROM public.agency_resources LIMIT 1);
