-- InsureTrac Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all necessary tables

-- Clients table (for QQCatalyst contact imports)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  
  -- QQCatalyst identifiers
  qq_contact_id VARCHAR(255) NOT NULL UNIQUE,
  customer_id VARCHAR(255),
  entity_id VARCHAR(255),
  
  -- Contact information
  contact_name VARCHAR(500),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  name VARCHAR(500),
  business_name VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Address information
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(50),
  zip VARCHAR(20),
  zip_code VARCHAR(20),
  
  -- Policy aggregation data
  policy_count INTEGER DEFAULT 0,
  total_premium DECIMAL(12, 2) DEFAULT 0,
  renewal_date TIMESTAMP,
  
  -- Status and metadata
  status VARCHAR(50) DEFAULT 'active',
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on qq_contact_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_qq_contact_id ON clients(qq_contact_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Policies table (for QQCatalyst policy imports)
CREATE TABLE IF NOT EXISTS policies (
  id SERIAL PRIMARY KEY,
  
  -- QQCatalyst identifiers
  qq_policy_id VARCHAR(255) UNIQUE,
  policy_number VARCHAR(255),
  
  -- Client reference
  client_id INTEGER REFERENCES clients(id),
  customer_id VARCHAR(255),
  named_insured VARCHAR(500),
  
  -- Policy details
  policy_type VARCHAR(255),
  lob VARCHAR(255),
  effective_date TIMESTAMP,
  expiration_date TIMESTAMP,
  
  -- Financial information
  premium DECIMAL(12, 2),
  total_premium DECIMAL(12, 2),
  
  -- Carrier and agent info
  insurance_company VARCHAR(500),
  carrier VARCHAR(500),
  writing_carrier VARCHAR(500),
  agent_name VARCHAR(255),
  mga VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  
  -- Additional data
  description TEXT,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for policies
CREATE INDEX IF NOT EXISTS idx_policies_qq_policy_id ON policies(qq_policy_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_number ON policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_customer_id ON policies(customer_id);
CREATE INDEX IF NOT EXISTS idx_policies_expiration_date ON policies(expiration_date);

-- Renewals table
CREATE TABLE IF NOT EXISTS renewals (
  id SERIAL PRIMARY KEY,
  
  -- QQCatalyst identifiers
  qq_policy_id VARCHAR(255) UNIQUE,
  policy_number VARCHAR(255),
  
  -- Named insured and contact info
  named_insured VARCHAR(500),
  contact_id INTEGER,
  
  -- Policy details
  policy_type VARCHAR(255),
  lob VARCHAR(255),
  effective_date TIMESTAMP,
  expiration_date TIMESTAMP,
  renewal_date TIMESTAMP,
  
  -- Financial information
  premium DECIMAL(12, 2),
  total_premium DECIMAL(12, 2),
  
  -- Carrier and agent info
  insurance_company VARCHAR(500),
  carrier VARCHAR(500),
  agent_name VARCHAR(255),
  mga VARCHAR(255),
  
  -- Status and tracking
  status VARCHAR(50) DEFAULT 'pending',
  archived BOOLEAN DEFAULT FALSE,
  
  -- Additional data
  description TEXT,
  notes TEXT,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for renewals
CREATE INDEX IF NOT EXISTS idx_renewals_expiration_date ON renewals(expiration_date);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON renewals(status);
CREATE INDEX IF NOT EXISTS idx_renewals_archived ON renewals(archived);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  
  tracking_number VARCHAR(255) UNIQUE,
  
  -- Client information
  client_name VARCHAR(500),
  client_id INTEGER,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  
  -- Application details
  policy_type VARCHAR(255),
  effective_date TIMESTAMP,
  expiration_date TIMESTAMP,
  
  -- Financial
  requested_premium DECIMAL(12, 2),
  quoted_premium DECIMAL(12, 2),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  
  -- Agent and carrier
  assigned_agent VARCHAR(255),
  carrier VARCHAR(500),
  
  -- Additional information
  description TEXT,
  notes TEXT,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_tracking_number ON submissions(tracking_number);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_client_id ON submissions(client_id);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  
  tracking_number VARCHAR(255) UNIQUE NOT NULL,
  
  -- Client and property information
  client_name VARCHAR(500),
  client_id INTEGER,
  property_address TEXT,
  
  -- Inspection details
  inspection_type VARCHAR(255),
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  
  -- Inspector information
  inspector_name VARCHAR(255),
  inspector_company VARCHAR(500),
  
  -- Status and results
  status VARCHAR(50) DEFAULT 'scheduled',
  result VARCHAR(50),
  
  -- Additional information
  notes TEXT,
  findings TEXT,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for inspections
CREATE INDEX IF NOT EXISTS idx_inspections_tracking_number ON inspections(tracking_number);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_client_id ON inspections(client_id);

-- Document Requests table
CREATE TABLE IF NOT EXISTS document_requests (
  id SERIAL PRIMARY KEY,
  
  tracking_number VARCHAR(255) UNIQUE NOT NULL,
  
  -- Client information
  client_name VARCHAR(500),
  client_id INTEGER,
  client_email VARCHAR(255),
  
  -- Agent information
  agent_name VARCHAR(255),
  agent_email VARCHAR(255),
  
  -- Request details
  document_type VARCHAR(255),
  description TEXT,
  
  -- Dates and deadlines
  requested_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  received_date TIMESTAMP,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  
  -- Additional information
  notes TEXT,
  json_raw JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for document_requests
CREATE INDEX IF NOT EXISTS idx_document_requests_tracking_number ON document_requests(tracking_number);
CREATE INDEX IF NOT EXISTS idx_document_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_document_requests_client_id ON document_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_due_date ON document_requests(due_date);

-- Add update trigger for updated_at fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_renewals_updated_at BEFORE UPDATE ON renewals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_requests_updated_at BEFORE UPDATE ON document_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
