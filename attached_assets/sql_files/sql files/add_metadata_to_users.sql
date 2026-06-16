-- Add metadata column to users table if it doesn't exist
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
