CREATE TABLE IF NOT EXISTS service_requests (
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

CREATE INDEX IF NOT EXISTS idx_service_requests_type ON service_requests(type);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_client_name ON service_requests(client_name);
CREATE INDEX IF NOT EXISTS idx_service_requests_policy_number ON service_requests(policy_number);
