-- Check if the renewals table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'renewals') THEN
        -- Create the renewals table if it doesn't exist
        CREATE TABLE renewals (
            id SERIAL PRIMARY KEY,
            renewal_id TEXT UNIQUE NOT NULL,
            date_entered DATE DEFAULT CURRENT_DATE,
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

        -- Add a trigger to update the updated_at timestamp
        CREATE OR REPLACE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_renewals_updated_at
        BEFORE UPDATE ON renewals
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    ELSE
        -- If the table exists but doesn't have the date_entered column, add it
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'renewals' 
                      AND column_name = 'date_entered') THEN
            ALTER TABLE renewals ADD COLUMN date_entered DATE DEFAULT CURRENT_DATE;
        END IF;
    END IF;
END
$$;
