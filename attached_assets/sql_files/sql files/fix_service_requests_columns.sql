-- Drop the existing table to start fresh
DROP TABLE IF EXISTS service_requests;

-- Create the service_requests table with the exact column names needed
CREATE TABLE service_requests (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  effective_date DATE NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL,
  specific_data JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_service_requests_type ON service_requests(type);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_client_name ON service_requests(client_name);
CREATE INDEX idx_service_requests_policy_number ON service_requests(policy_number);

-- Disable RLS for this table
ALTER TABLE service_requests DISABLE ROW LEVEL SECURITY;
