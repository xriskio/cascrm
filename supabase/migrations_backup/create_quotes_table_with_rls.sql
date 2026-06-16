-- Create quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  submission_type VARCHAR(100),
  insurance_type VARCHAR(100),
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  insured_name VARCHAR(255),
  insured_address TEXT,
  follow_up_2_date DATE,
  follow_up_final_date DATE,
  disposition_status VARCHAR(50) DEFAULT 'pending',
  total_premium DECIMAL(12,2),
  total_monthly_payment DECIMAL(12,2),
  total_down_payment DECIMAL(12,2),
  number_of_installments INTEGER,
  notes TEXT,
  quote_status VARCHAR(50) DEFAULT 'draft',
  carriers JSONB DEFAULT '[]'::jsonb,
  coverages JSONB DEFAULT '[]'::jsonb,
  exclusions TEXT,
  user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development (can be enabled later for production)
ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(quote_status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at);

-- Create a sequence for quote numbers if needed
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1000;

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_quotes_updated_at();

-- Grant permissions (adjust as needed for your setup)
GRANT ALL ON public.quotes TO PUBLIC;
GRANT ALL ON public.quotes TO anon;
GRANT USAGE ON SEQUENCE quote_number_seq TO PUBLIC;
GRANT USAGE ON SEQUENCE quote_number_seq TO anon;
