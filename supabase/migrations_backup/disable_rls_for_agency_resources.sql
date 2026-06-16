-- Disable RLS for agency_resources table
ALTER TABLE public.agency_resources DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to authenticated users
GRANT ALL ON public.agency_resources TO PUBLIC;
GRANT ALL ON public.agency_resources TO service_role;
