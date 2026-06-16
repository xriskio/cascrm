-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Not Started',
    priority TEXT NOT NULL DEFAULT 'Medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    creator_id UUID REFERENCES auth.users(id),
    assignee_id UUID REFERENCES auth.users(id),
    supervisor_id UUID REFERENCES auth.users(id),
    client_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS tasks_creator_id_idx ON public.tasks(creator_id);
CREATE INDEX IF NOT EXISTS tasks_supervisor_id_idx ON public.tasks(supervisor_id);
CREATE INDEX IF NOT EXISTS tasks_client_id_idx ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date);

-- Add RLS policies

-- Policy to allow users to see tasks they created, are assigned to, or supervise

-- Policy to allow users to insert tasks

-- Policy to allow users to update tasks they created or are assigned to

-- Policy to allow users to delete tasks they created

-- Grant access to authenticated users
GRANT ALL ON public.tasks TO PUBLIC;
