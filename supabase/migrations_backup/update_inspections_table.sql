-- Create inspections table if it doesn't exist
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  named_insured TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  effective_date DATE,
  noc_date DATE,
  insurance_company TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  contact_company TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  property_address TEXT,
  inspection_type TEXT,
  inspection_date DATE,
  inspector TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  missing_photos BOOLEAN DEFAULT false,
  missing_documents BOOLEAN DEFAULT false,
  missing_certificates BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create inspection_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS inspection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  insurance_company TEXT NOT NULL,
  request_date DATE DEFAULT CURRENT_DATE,
  requested_by TEXT,
  preferred_dates JSONB,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies

-- Create policies that allow all authenticated users to perform all operations


-- Insert sample data
INSERT INTO inspections (
  named_insured, 
  policy_number, 
  effective_date, 
  noc_date, 
  insurance_company, 
  policy_type, 
  contact_company, 
  contact_name, 
  contact_phone, 
  contact_email, 
  property_address, 
  inspection_type, 
  inspection_date, 
  inspector, 
  status, 
  notes, 
  missing_photos, 
  missing_documents, 
  missing_certificates, 
  priority
) VALUES 
(
  'ABC Manufacturing', 
  'CP-12345678', 
  '2023-01-15', 
  '2023-06-15', 
  'Travelers Insurance', 
  'Commercial Property', 
  'ABC Manufacturing', 
  'John Doe', 
  '503-555-1234', 
  'john@abcmanufacturing.com', 
  '123 Industrial Way, Portland, OR', 
  'Property Risk Assessment', 
  '2023-06-15', 
  'John Smith', 
  'Scheduled', 
  'Annual inspection for policy renewal', 
  true, 
  true, 
  false, 
  'high'
),
(
  'XYZ Retail', 
  'GL-87654321', 
  '2023-02-01', 
  '2023-07-01', 
  'Hartford Insurance', 
  'General Liability', 
  'XYZ Retail', 
  'Jane Smith', 
  '206-555-5678', 
  'jane@xyzretail.com', 
  '456 Main St, Seattle, WA', 
  'Safety Compliance', 
  '2023-06-22', 
  'Sarah Johnson', 
  'Confirmed', 
  'Safety inspection for retail location', 
  false, 
  true, 
  true, 
  'medium'
);

-- Insert sample inspection requests
INSERT INTO inspection_requests (
  client, 
  policy_number, 
  policy_type, 
  insurance_company, 
  request_date, 
  requested_by, 
  preferred_dates, 
  status, 
  notes
) VALUES 
(
  'ABC Manufacturing', 
  'CP-12345678', 
  'Commercial Property', 
  'Travelers Insurance', 
  '2023-05-15', 
  'Underwriter', 
  '["2023-06-10", "2023-06-15", "2023-06-20"]', 
  'pending', 
  'New policy requires inspection within 30 days of effective date.'
),
(
  'XYZ Retail', 
  'GL-87654321', 
  'General Liability', 
  'Hartford Insurance', 
  '2023-05-18', 
  'Agent', 
  '["2023-06-05", "2023-06-12"]', 
  'approved', 
  'Client requested inspection for risk management purposes.'
);
