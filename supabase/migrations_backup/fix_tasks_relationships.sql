-- Fix the relationships for the tasks table
BEGIN;

-- Check if the tasks table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
    ) THEN
        -- Create the tasks table if it doesn't exist
        CREATE TABLE public.tasks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'Not Started',
            priority TEXT NOT NULL DEFAULT 'Medium',
            due_date DATE,
            completion_percentage INTEGER NOT NULL DEFAULT 0,
            creator_id UUID,
            assignee_id UUID,
            supervisor_id UUID,
            client_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Disable RLS for tasks
        ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Make sure the users table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) THEN
        -- Create a basic users table if it doesn't exist
        CREATE TABLE public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT,
            first_name TEXT,
            last_name TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Disable RLS for users
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Make sure the clients table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
    ) THEN
        -- Create a basic clients table if it doesn't exist
        CREATE TABLE public.clients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Disable RLS for clients
        ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Fix the tasks table foreign keys
DO $$
BEGIN
    -- Drop existing foreign keys if they exist
    BEGIN
        ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_creator_id_fkey;
        EXCEPTION WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
        EXCEPTION WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_supervisor_id_fkey;
        EXCEPTION WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_client_id_fkey;
        EXCEPTION WHEN undefined_object THEN NULL;
    END;

    -- Add the foreign keys with proper references
    ALTER TABLE public.tasks 
    ADD CONSTRAINT tasks_creator_id_fkey 
    FOREIGN KEY (creator_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;

    ALTER TABLE public.tasks 
    ADD CONSTRAINT tasks_assignee_id_fkey 
    FOREIGN KEY (assignee_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;

    ALTER TABLE public.tasks 
    ADD CONSTRAINT tasks_supervisor_id_fkey 
    FOREIGN KEY (supervisor_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;

    ALTER TABLE public.tasks 
    ADD CONSTRAINT tasks_client_id_fkey 
    FOREIGN KEY (client_id) 
    REFERENCES public.clients(id) 
    ON DELETE SET NULL;
END
$$;

COMMIT;
