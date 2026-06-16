-- Drop and recreate the annual_income column to ensure it exists
ALTER TABLE public.customers DROP COLUMN IF EXISTS annual_income;
ALTER TABLE public.customers ADD COLUMN annual_income numeric;

-- Also ensure all other required columns exist
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_number text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS social_security text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS industry text;
