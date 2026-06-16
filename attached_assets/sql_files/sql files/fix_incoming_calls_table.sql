-- Check if the incoming_calls table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incoming_calls') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.incoming_calls (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      call_date DATE,
      call_time TIME,
      named_insured TEXT,
      contact_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      reason TEXT,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      call_back_date DATE,
      call_back_time TIME,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_by UUID REFERENCES auth.users(id),
      updated_by UUID REFERENCES auth.users(id)
    );
  ELSE
    -- Add any missing columns to the existing table
    BEGIN
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'call_date') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN call_date DATE;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'call_time') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN call_time TIME;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'named_insured') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN named_insured TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'contact_name') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN contact_name TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'phone') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN phone TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'email') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN email TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'reason') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN reason TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'category') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN category TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'status') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN status TEXT DEFAULT 'pending';
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'call_back_date') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN call_back_date DATE;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'call_back_time') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN call_back_time TIME;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'notes') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN notes TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'created_at') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'updated_at') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'created_by') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN created_by UUID REFERENCES auth.users(id);
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incoming_calls' AND column_name = 'updated_by') THEN
        ALTER TABLE public.incoming_calls ADD COLUMN updated_by UUID REFERENCES auth.users(id);
      END IF;
    END;
  END IF;
  
  -- Disable RLS for this table
  ALTER TABLE public.incoming_calls DISABLE ROW LEVEL SECURITY;
  
  -- Grant access to authenticated users
  GRANT ALL ON public.incoming_calls TO authenticated;
  GRANT ALL ON public.incoming_calls TO service_role;
END
$$;
