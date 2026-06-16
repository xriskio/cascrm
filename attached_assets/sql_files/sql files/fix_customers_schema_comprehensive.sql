-- Create a comprehensive schema for the customers table with all required fields
-- First, check if the table exists and create it if not
CREATE TABLE IF NOT EXISTS public.customers (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add all required columns to ensure they exist
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_number text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'personal';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_status text DEFAULT 'active';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS contact_type text DEFAULT 'customers';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS location text;

-- Personal Information
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS middle_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS dob date; -- Alternative column name
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS ssn_last4 text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS marital_status text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS social_security text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'English';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS residency_type text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_owner boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS driver_license_number text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS driver_license_state text;

-- Mailing Address
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS mailing_address text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS mailing_city text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS mailing_state text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS mailing_zip text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS mailing_country text DEFAULT 'USA';

-- Contact Information
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS primary_phone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS primary_phone_type text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone_type text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS secondary_phone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS secondary_phone_type text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS preferred_contact_method text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email_address text;

-- Employment Information
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS employer text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS years_at_current_employer integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS annual_income numeric;

-- Co-Applicant Information
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_first_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_last_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_relationship text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_dob date;

-- Current Insurance Information
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_insurance_carrier text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS years_with_current_carrier text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_policy_expiration date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_premium numeric;

-- Policy Types Needed
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_homeowners boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_auto boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_umbrella boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_boat boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_motorcycle boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_rv boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS desired_effective_date date;

-- Business Information
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS federal_ein text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_entity text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS year_business_started integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS number_of_employees integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS annual_revenue numeric;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_description text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS years_in_business integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS title text;

-- Account Information
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Normal';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_since date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS agent text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS csr text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_source text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS source_detail text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS notes text;

-- Commercial-specific fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_general_liability boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_property boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_workers_comp boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_professional_liability boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_cyber boolean DEFAULT false;

-- Physical Address (if different from mailing)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS same_as_mailing boolean DEFAULT true;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_address text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_city text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_state text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_zip text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_country text DEFAULT 'USA';

-- Create customer number generation function if it doesn't exist
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    customer_number TEXT;
BEGIN
    -- Get the highest customer number and increment (starting from 301556)
    SELECT COALESCE(MAX(CAST(customer_number AS INTEGER)), 301555) + 1
    INTO next_number
    FROM customers
    WHERE customer_number ~ '^[0-9]+$';
    
    customer_number := next_number::TEXT;
    
    RETURN customer_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate customer number
CREATE OR REPLACE FUNCTION set_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_customer_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_set_customer_number ON customers;
CREATE TRIGGER trigger_set_customer_number
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION set_customer_number();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customers_updated_at ON customers;
CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- Enable Row Level Security if not already enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
