-- First check if the table exists and drop it to recreate with the correct schema
DROP TABLE IF EXISTS users;

-- Create a proper users table with the correct fields
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT, -- Using 'name' instead of 'full_name'
  user_role TEXT DEFAULT 'user', -- Using 'user_role' instead of 'role'
  is_active BOOLEAN DEFAULT TRUE, -- Using 'is_active' instead of 'active'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Add an example comment to make it clear this is the correct schema
COMMENT ON TABLE users IS 'User profiles for the InsureTrac application';
