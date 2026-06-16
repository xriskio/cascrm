-- Add archived status to tasks table if it doesn't exist
DO $$
BEGIN
    -- Check if the tasks table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Add archived status constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name = 'tasks_status_check'
        ) THEN
            ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
            ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
            CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'On Hold', 'Archived'));
        END IF;
    END IF;
END $$;
