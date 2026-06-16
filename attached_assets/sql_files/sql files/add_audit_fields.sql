-- Add audit fields to all relevant tables

-- Function to safely add columns if they don't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  _table text, 
  _column text, 
  _type text,
  _default text DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS(
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = _table 
    AND column_name = _column
  ) THEN
    IF _default IS NULL THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', _table, _column, _type);
    ELSE
      EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s DEFAULT %s', _table, _column, _type, _default);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Tables that need audit fields
DO $$
DECLARE
  tables text[] := ARRAY[
    'submissions', 
    'renewals', 
    'service_requests', 
    'carrier_contacts', 
    'agency_resources',
    'leads'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    -- Skip if table doesn't exist
    CONTINUE WHEN NOT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = t
    );
    
    -- Add created_by field (UUID of the user who created the record)
    PERFORM add_column_if_not_exists(t, 'created_by', 'UUID');
    
    -- Add created_by_name field (name of the user who created the record)
    PERFORM add_column_if_not_exists(t, 'created_by_name', 'TEXT');
    
    -- Add updated_by field (UUID of the user who last updated the record)
    PERFORM add_column_if_not_exists(t, 'updated_by', 'UUID');
    
    -- Add updated_by_name field (name of the user who last updated the record)
    PERFORM add_column_if_not_exists(t, 'updated_by_name', 'TEXT');
    
    -- Make sure created_at exists
    PERFORM add_column_if_not_exists(t, 'created_at', 'TIMESTAMPTZ', 'NOW()');
    
    -- Make sure updated_at exists
    PERFORM add_column_if_not_exists(t, 'updated_at', 'TIMESTAMPTZ', 'NOW()');
    
    RAISE NOTICE 'Added audit fields to %', t;
  END LOOP;
END $$;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID,
  user_name TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
ON audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON audit_logs(created_at);
