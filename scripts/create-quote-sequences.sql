-- Create sequences for quote number generation
CREATE SEQUENCE IF NOT EXISTS ho_quote_seq START 625;
CREATE SEQUENCE IF NOT EXISTS pa_quote_seq START 1;
CREATE SEQUENCE IF NOT EXISTS dp_quote_seq START 1;
CREATE SEQUENCE IF NOT EXISTS ll_quote_seq START 1;

-- Create sequences for policy number generation
CREATE SEQUENCE IF NOT EXISTS ho_policy_seq START 625;
CREATE SEQUENCE IF NOT EXISTS pa_policy_seq START 1;
CREATE SEQUENCE IF NOT EXISTS dp_policy_seq START 1;
CREATE SEQUENCE IF NOT EXISTS ll_policy_seq START 1;

-- Function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number(quote_type TEXT)
RETURNS TEXT AS $$
DECLARE
    sequence_name TEXT;
    prefix TEXT;
    next_val INTEGER;
    formatted_number TEXT;
BEGIN
    CASE quote_type
        WHEN 'HO' THEN
            sequence_name := 'ho_quote_seq';
            prefix := 'HOQ01-';
        WHEN 'PA' THEN
            sequence_name := 'pa_quote_seq';
            prefix := 'PAQ01-';
        WHEN 'DP' THEN
            sequence_name := 'dp_quote_seq';
            prefix := 'DPQ01-';
        WHEN 'LL' THEN
            sequence_name := 'll_quote_seq';
            prefix := 'LLQ01-';
        ELSE
            RAISE EXCEPTION 'Invalid quote type: %', quote_type;
    END CASE;
    
    EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_val;
    formatted_number := LPAD(next_val::TEXT, 7, '0');
    
    RETURN prefix || formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Function to convert quote number to policy number
CREATE OR REPLACE FUNCTION convert_to_policy_number(quote_number TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN quote_number LIKE 'HOQ%' THEN REPLACE(quote_number, 'HOQ', 'HOI')
        WHEN quote_number LIKE 'PAQ%' THEN REPLACE(quote_number, 'PAQ', 'PAI')
        WHEN quote_number LIKE 'DPQ%' THEN REPLACE(quote_number, 'DPQ', 'DPI')
        WHEN quote_number LIKE 'LLQ%' THEN REPLACE(quote_number, 'LLQ', 'LLI')
        ELSE quote_number
    END;
END;
$$ LANGUAGE plpgsql;

-- Test the functions
SELECT generate_quote_number('HO') as ho_quote;
SELECT generate_quote_number('PA') as pa_quote;
SELECT convert_to_policy_number('HOQ01-0000625') as policy_number;
