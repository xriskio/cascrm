-- Add missing quote-related columns to renewals table
ALTER TABLE renewals 
ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS quote_data JSONB,
ADD COLUMN IF NOT EXISTS quote_generated_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_version INTEGER DEFAULT 1;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_renewals_quote_number ON renewals(quote_number);
CREATE INDEX IF NOT EXISTS idx_renewals_quote_generated_date ON renewals(quote_generated_date);
CREATE INDEX IF NOT EXISTS idx_renewals_quote_sent_date ON renewals(quote_sent_date);

-- Update existing renewals to have default quote version
UPDATE renewals SET quote_version = 1 WHERE quote_version IS NULL;
