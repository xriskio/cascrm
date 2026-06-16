-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create failed_login_attempts table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security_settings table
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_name TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default security settings
INSERT INTO security_settings (setting_name, setting_value, description)
VALUES
  ('password_expiry_days', '90', 'Number of days before passwords expire'),
  ('max_login_attempts', '5', 'Maximum number of failed login attempts before lockout'),
  ('lockout_duration_minutes', '15', 'Duration of account lockout in minutes'),
  ('session_timeout_minutes', '30', 'Duration of inactivity before session timeout'),
  ('mfa_required', 'false', 'Whether multi-factor authentication is required')
ON CONFLICT (setting_name) DO NOTHING;

-- Create function to log failed login attempts
CREATE OR REPLACE FUNCTION log_failed_login()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO failed_login_attempts (email, ip_address, user_agent)
  VALUES (NEW.email, NEW.ip_address, NEW.user_agent);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for security tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY audit_logs_admin_policy ON audit_logs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Only admins can view failed login attempts
CREATE POLICY failed_login_attempts_admin_policy ON failed_login_attempts
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Only admins can modify security settings
CREATE POLICY security_settings_admin_policy ON security_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Create index on failed_login_attempts for performance
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON failed_login_attempts(attempt_time);
