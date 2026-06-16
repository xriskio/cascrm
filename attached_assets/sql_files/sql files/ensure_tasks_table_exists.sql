-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Not Started',
  priority VARCHAR(50) DEFAULT 'Medium',
  due_date DATE,
  completion_percentage INTEGER DEFAULT 0,
  creator_id UUID REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  supervisor_id UUID REFERENCES auth.users(id),
  client_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Disable RLS for now to avoid permission issues
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role;
