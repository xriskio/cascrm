-- Update customers table to include all missing fields for personal lines
ALTER TABLE customers ADD COLUMN IF NOT EXISTS annual_income DECIMAL(12, 2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

-- Add customer number generation function for personal lines
CREATE OR REPLACE FUNCTION generate_personal_customer_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    customer_number TEXT;
BEGIN
    -- Get the highest customer number and increment (starting from 301556)
    SELECT COALESCE(MAX(CAST(customer_number AS INTEGER)), 301555) + 1
    INTO next_number
    FROM customers
    WHERE customer_number ~ '^[0-9]+$' AND customer_type = 'personal';
    
    customer_number := next_number::TEXT;
    
    RETURN customer_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate customer number for personal lines
CREATE OR REPLACE FUNCTION set_personal_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        IF NEW.customer_type = 'personal' THEN
            NEW.customer_number := generate_personal_customer_number();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_set_customer_number ON customers;
CREATE TRIGGER trigger_set_customer_number
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION set_personal_customer_number();

-- Create updated_at trigger for customers
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
