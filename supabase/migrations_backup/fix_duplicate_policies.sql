-- Remove duplicate policies and recreate them safely
DO $$
BEGIN
    -- Drop existing policies if they exist
    
    -- Create policies only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE polname = 'Users can view all renewal status history' 
        AND tablename = 'renewal_status_history'
    ) THEN
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE polname = 'Users can insert renewal status history' 
        AND tablename = 'renewal_status_history'
    ) THEN
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE polname = 'Users can update renewal status history' 
        AND tablename = 'renewal_status_history'
    ) THEN
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE polname = 'Users can delete renewal status history' 
        AND tablename = 'renewal_status_history'
    ) THEN
    END IF;
END $$;
