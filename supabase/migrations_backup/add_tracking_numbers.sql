-- Add tracking number columns to tasks and renewals tables

-- Add task_number to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_number VARCHAR(50) UNIQUE;

-- Add renewal_number to renewals table  
ALTER TABLE renewals ADD COLUMN IF NOT EXISTS renewal_number VARCHAR(50) UNIQUE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_task_number ON tasks(task_number);
CREATE INDEX IF NOT EXISTS idx_renewals_renewal_number ON renewals(renewal_number);

-- Add comments for documentation
COMMENT ON COLUMN tasks.task_number IS 'Unique tracking number for tasks (format: TSK-{timestamp}-{random})';
COMMENT ON COLUMN renewals.renewal_number IS 'Unique tracking number for renewals (format: RNW-{timestamp}-{random})';
