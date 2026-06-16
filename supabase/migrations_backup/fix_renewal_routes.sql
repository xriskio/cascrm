-- Add missing columns to renewals table
ALTER TABLE renewals 
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS workflow_stage VARCHAR(50) DEFAULT 'initial',
ADD COLUMN IF NOT EXISTS quote_data JSONB,
ADD COLUMN IF NOT EXISTS remarketing_companies JSONB DEFAULT '[]'::jsonb;

-- Create index for tracking numbers
CREATE INDEX IF NOT EXISTS idx_renewals_tracking_number ON renewals(tracking_number);
CREATE INDEX IF NOT EXISTS idx_renewals_assigned_agent ON renewals(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_renewals_expiration_date ON renewals(expiration_date);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON renewals(status);

-- Create renewal status history table
CREATE TABLE IF NOT EXISTS renewal_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  renewal_id UUID REFERENCES renewals(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_name VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for status history
CREATE INDEX IF NOT EXISTS idx_renewal_status_history_renewal_id ON renewal_status_history(renewal_id);
CREATE INDEX IF NOT EXISTS idx_renewal_status_history_changed_at ON renewal_status_history(changed_at);

-- Update existing renewals with tracking numbers if they don't have them
UPDATE renewals 
SET tracking_number = 'REN-' || UPPER(SUBSTRING(id::text, 1, 8)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 6))
WHERE tracking_number IS NULL;

-- Enable RLS

-- Create RLS policies for renewal_status_history

