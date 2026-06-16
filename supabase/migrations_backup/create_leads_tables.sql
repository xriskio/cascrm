-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT,
  product_interest TEXT,
  notes TEXT,
  assigned_to TEXT,
  status TEXT DEFAULT 'new'
);

-- Create lead_comments table
CREATE TABLE IF NOT EXISTS lead_comments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  author TEXT,
  comment TEXT NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_lead_comments_lead_id ON lead_comments(lead_id);
