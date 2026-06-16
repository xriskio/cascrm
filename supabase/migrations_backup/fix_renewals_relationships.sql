-- First, let's check if the renewals table exists and fix the schema
DO $$ 
BEGIN
    -- Add assigned_agent_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'assigned_agent_id'
    ) THEN
        ALTER TABLE renewals ADD COLUMN assigned_agent_id UUID REFERENCES profiles(id);
    END IF;

    -- Add tracking_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE renewals ADD COLUMN tracking_number TEXT;
    END IF;

    -- Add archived column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'archived'
    ) THEN
        ALTER TABLE renewals ADD COLUMN archived BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'renewals' AND column_name = 'status'
    ) THEN
        ALTER TABLE renewals ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample profiles if none exist
INSERT INTO profiles (id, full_name, email, role)
SELECT 
    gen_random_uuid(),
    'Sample Agent',
    'agent@example.com',
    'agent'
WHERE NOT EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- Create renewal_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS renewal_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    renewal_id UUID REFERENCES renewals(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT,
    changed_by_name TEXT,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing renewals to have tracking numbers if they don't
UPDATE renewals 
SET tracking_number = 'REN-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE tracking_number IS NULL OR tracking_number = '';

-- Update existing renewals to have status if they don't
UPDATE renewals 
SET status = 'pending'
WHERE status IS NULL OR status = '';

-- Update existing renewals to not be archived
UPDATE renewals 
SET archived = FALSE
WHERE archived IS NULL;

-- Enable RLS

-- Create policies for renewals

-- Create policies for profiles

-- Create policies for renewal_status_history
