-- Add missing fields to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_number text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS social_security text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS federal_ein text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_entity text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS year_business_started integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS number_of_employees integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_description text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS years_in_business integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS same_as_mailing boolean DEFAULT true;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_address text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_city text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_state text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_zip text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS physical_country text DEFAULT 'USA';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_insurance_carrier text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS years_with_current_carrier text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_policy_expiration date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS current_premium text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_homeowners boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_auto boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_umbrella boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_boat boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_motorcycle boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_rv boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_general_liability boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_property boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_workers_comp boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_professional_liability boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS policy_cyber boolean DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS desired_effective_date date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_first_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_last_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_relationship text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS co_applicant_dob date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS notes text;

-- Create customer number generation function
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
