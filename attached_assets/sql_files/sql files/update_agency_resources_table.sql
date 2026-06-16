-- Check if agency_resources table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'agency_resources'
  ) THEN
    -- Create the agency_resources table
    CREATE TABLE public.agency_resources (
      id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT,
      category TEXT DEFAULT 'Other',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID,
      file_type TEXT DEFAULT 'pdf'
    );
  ELSE
    -- Add any missing columns to existing table
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'agency_resources' 
      AND column_name = 'file_type'
    ) THEN
      ALTER TABLE public.agency_resources ADD COLUMN file_type TEXT DEFAULT 'pdf';
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'agency_resources' 
      AND column_name = 'category'
    ) THEN
      ALTER TABLE public.agency_resources ADD COLUMN category TEXT DEFAULT 'Other';
    END IF;
  END IF;
END $$;

-- Create storage bucket for resources if it doesn't exist
-- Note: This requires superuser privileges and may need to be done manually
-- in the Supabase dashboard if running as a migration
