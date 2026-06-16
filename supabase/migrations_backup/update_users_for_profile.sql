-- Add notification_preferences column to users table if it doesn't exist
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_notifications": true, "sms_notifications": false, "in_app_notifications": true, "marketing_emails": false}';

-- Ensure first_name and last_name columns exist
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
