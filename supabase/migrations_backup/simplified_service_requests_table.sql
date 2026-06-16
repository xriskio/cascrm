-- First, drop the table if it exists to start fresh
DROP TABLE IF EXISTS service_requests;

-- Create a simplified service_requests table with all fields as text
CREATE TABLE service_requests (
  id SERIAL PRIMARY KEY,
  request_type TEXT NOT NULL,
  client_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  request_description TEXT NOT NULL,
  urgency TEXT NOT NULL,
  specific_data TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- Disable RLS for this table
ALTER TABLE service_requests DISABLE ROW LEVEL SECURITY;
