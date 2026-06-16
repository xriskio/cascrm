-- Add archived and archived_at fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when filtering archived tasks
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON tasks(archived_at);

-- Update existing tasks to have archived = false if null
UPDATE tasks SET archived = FALSE WHERE archived IS NULL;
