-- Create submissions table with the correct schema
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  submission_number VARCHAR(255) NOT NULL UNIQUE,
  insurance_type VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  form_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on submission_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_number ON submissions(submission_number);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Create index on insurance_type for filtering
CREATE INDEX IF NOT EXISTS idx_submissions_insurance_type ON submissions(insurance_type);
