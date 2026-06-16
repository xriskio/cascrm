-- Create field mappings table for storing QQ API to database field mappings
CREATE TABLE IF NOT EXISTS field_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('renewals', 'clients')),
  mappings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_field_mappings_type ON field_mappings(type);
CREATE INDEX IF NOT EXISTS idx_field_mappings_name ON field_mappings(name);

-- Enable RLS

-- Create policy for authenticated users

-- Add helpful comment
COMMENT ON TABLE field_mappings IS 'Stores field mapping configurations for QQCatalyst API imports';
