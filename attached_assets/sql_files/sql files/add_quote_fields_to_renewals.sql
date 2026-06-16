-- Add quote-related fields to renewals table
ALTER TABLE renewals 
ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS quote_generated_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_version INTEGER DEFAULT 1;

-- Add index for quote number
CREATE INDEX IF NOT EXISTS idx_renewals_quote_number ON renewals(quote_number);
