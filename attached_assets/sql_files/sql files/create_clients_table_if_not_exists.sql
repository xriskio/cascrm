-- Check if clients table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
    ) THEN
        -- Create the clients table if it doesn't exist
        CREATE TABLE public.clients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            contact_name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            created_by UUID REFERENCES auth.users(id),
            updated_by UUID REFERENCES auth.users(id)
        );

        -- Add RLS policies
        ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
        
        -- Allow authenticated users to view all clients
        CREATE POLICY "Allow authenticated users to view all clients"
            ON public.clients
            FOR SELECT
            TO authenticated
            USING (true);
            
        -- Allow authenticated users to insert clients
        CREATE POLICY "Allow authenticated users to insert clients"
            ON public.clients
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
            
        -- Allow authenticated users to update their own clients
        CREATE POLICY "Allow authenticated users to update their own clients"
            ON public.clients
            FOR UPDATE
            TO authenticated
            USING (created_by = auth.uid() OR auth.uid() IN (
                SELECT id FROM users WHERE role = 'admin'
            ));
            
        -- Allow authenticated users to delete their own clients
        CREATE POLICY "Allow authenticated users to delete their own clients"
            ON public.clients
            FOR DELETE
            TO authenticated
            USING (created_by = auth.uid() OR auth.uid() IN (
                SELECT id FROM users WHERE role = 'admin'
            ));
            
        -- Insert some sample clients for testing
        INSERT INTO public.clients (name, contact_name, email, phone)
        VALUES 
            ('ABC Manufacturing', 'John Doe', 'john@abcmfg.com', '555-123-4567'),
            ('XYZ Retail', 'Jane Smith', 'jane@xyzretail.com', '555-987-6543'),
            ('123 Properties LLC', 'Bob Johnson', 'bob@123prop.com', '555-456-7890');
    END IF;
END
$$;
