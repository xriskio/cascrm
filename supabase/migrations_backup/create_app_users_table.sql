-- Drop the table if it exists
DROP TABLE IF EXISTS app_users;

-- Create a new table with a different name to avoid caching issues
CREATE TABLE app_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Disable RLS for the table
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- Create an index on email for faster lookups
CREATE INDEX idx_app_users_email ON app_users(email);
