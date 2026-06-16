-- Enhanced renewals table to support QQCatalyst API data
CREATE TABLE IF NOT EXISTS renewals_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- QQCatalyst Policy Information
  qq_policy_id VARCHAR,
  qq_contact_id VARCHAR,
  qq_policy_number VARCHAR,
  qq_policy_type VARCHAR,
  qq_line_of_business VARCHAR,
  
  -- Policy Details
  policy_number VARCHAR,
  policy_type VARCHAR,
  line_of_business VARCHAR,
  carrier_name VARCHAR,
  carrier_id VARCHAR,
  
  -- Client Information
  client_id UUID REFERENCES clients(id),
  client_name VARCHAR,
  insured_name VARCHAR,
  business_name VARCHAR,
  
  -- Dates
  policy_effective_date DATE,
  policy_expiration_date DATE,
  renewal_date DATE,
  created_date DATE,
  last_modified_date TIMESTAMP,
  
  -- Financial Information
  current_premium DECIMAL(12,2),
  renewal_premium DECIMAL(12,2),
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(12,2),
  
  -- Status and Workflow
  renewal_status VARCHAR DEFAULT 'pending',
  workflow_stage VARCHAR,
  priority_level VARCHAR,
  
  -- Contact Information
  agent_id VARCHAR,
  agent_name VARCHAR,
  csr_id VARCHAR,
  csr_name VARCHAR,
  
  -- Location Information
  risk_state VARCHAR(2),
  risk_city VARCHAR,
  risk_zip VARCHAR,
  
  -- Additional Fields
  coverage_details JSONB,
  underwriting_notes TEXT,
  renewal_notes TEXT,
  
  -- QQCatalyst Raw Data
  qq_raw_data JSONB,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Indexes
  UNIQUE(qq_policy_id, policy_expiration_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_renewals_enhanced_expiration ON renewals_enhanced(policy_expiration_date);
CREATE INDEX IF NOT EXISTS idx_renewals_enhanced_status ON renewals_enhanced(renewal_status);
CREATE INDEX IF NOT EXISTS idx_renewals_enhanced_qq_policy ON renewals_enhanced(qq_policy_id);
CREATE INDEX IF NOT EXISTS idx_renewals_enhanced_client ON renewals_enhanced(client_id);
CREATE INDEX IF NOT EXISTS idx_renewals_enhanced_agent ON renewals_enhanced(agent_id);

-- Enable RLS

-- Create RLS policies
