-- First, let's check if the renewals table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'renewals') THEN
        -- Table exists, check if the column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'renewals' AND column_name = 'date_entered') THEN
            -- Add the missing column
            ALTER TABLE renewals ADD COLUMN date_entered DATE;
        END IF;
    ELSE
        -- Table doesn't exist, create it with all required columns
        CREATE TABLE renewals (
          id SERIAL PRIMARY KEY,
          renewal_id TEXT UNIQUE NOT NULL,
          date_entered DATE,
          insured_name TEXT NOT NULL,
          retail_agency_name TEXT,
          producer TEXT,
          policy_type TEXT,
          policy_number TEXT,
          effective_date DATE,
          expiration_date DATE NOT NULL,
          insurance_carrier TEXT NOT NULL,
          expiring_premium DECIMAL(10,2),
          expiring_commission DECIMAL(10,2),
          wholesaler_mga TEXT,
          renewal_premium DECIMAL(10,2),
          renewal_commission DECIMAL(10,2),
          status TEXT NOT NULL DEFAULT 'pending',
          last_contact_date DATE,
          next_follow_up_date DATE,
          date_renewal_sent DATE,
          date_quote_received DATE,
          date_sent_to_insured DATE,
          remarketing_requested BOOLEAN DEFAULT FALSE,
          reason_lost TEXT,
          notes TEXT,
          task TEXT,
          documents TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;
