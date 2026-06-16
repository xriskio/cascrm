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
            creator_id UUID REFERENCES auth.users(id),
            assignee_id UUID REFERENCES auth.users(id),
            supervisor_id UUID REFERENCES auth.users(id),
            client_id UUID REFERENCES public.clients(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add RLS policies

        -- Policy to allow users to see their own tasks or tasks they created or supervise

        -- Policy to allow users to insert their own tasks

        -- Policy to allow users to update their own tasks or tasks assigned to them

        -- Policy to allow users to delete their own tasks
    ELSE
        -- Make sure all required columns exist
        DO $$
        BEGIN
            -- Add completion_percentage if it doesn't exist
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'tasks' 
                AND column_name = 'completion_percentage'
            ) THEN
                ALTER TABLE public.tasks ADD COLUMN completion_percentage INTEGER NOT NULL DEFAULT 0;
            END IF;

            -- Add client_id if it doesn't exist
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'tasks' 
                AND column_name = 'client_id'
            ) THEN
                ALTER TABLE public.tasks ADD COLUMN client_id UUID REFERENCES public.clients(id);
            END IF;

            -- Add supervisor_id if it doesn't exist
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'tasks' 
                AND column_name = 'supervisor_id'
            ) THEN
                ALTER TABLE public.tasks ADD COLUMN supervisor_id UUID REFERENCES auth.users(id);
            END IF;
        END $$;
    END IF;
END
$$;
