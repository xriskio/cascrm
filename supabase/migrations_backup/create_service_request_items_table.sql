-- Create a completely new table with a different name to avoid caching issues
CREATE TABLE service_request_items (
  id SERIAL PRIMARY KEY,
  request_type VARCHAR(100) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  effective_date VARCHAR(50) NOT NULL,
  request_description TEXT NOT NULL,
  urgency VARCHAR(50) NOT NULL,
  specific_data TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at VARCHAR(50) NOT NULL,
  updated_at VARCHAR(50)
);

-- Create indexes for better performance
CREATE INDEX idx_service_request_items_type ON service_request_items(request_type);
CREATE INDEX idx_service_request_items_status ON service_request_items(status);

-- Disable RLS for this table
ALTER TABLE service_request_items DISABLE ROW LEVEL SECURITY;
