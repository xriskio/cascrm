-- Create storage buckets for the application
DO $$
BEGIN
    -- Check if the storage extension is available
    IF EXISTS (
        SELECT 1
        FROM pg_extension
        WHERE extname = 'storage'
    ) THEN
        -- Create resources bucket if it doesn't exist
        BEGIN
            EXECUTE 'SELECT create_bucket(''resources'')';
            RAISE NOTICE 'Created resources bucket';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Resources bucket already exists or could not be created: %', SQLERRM;
        END;
        
        -- Create agency-resources bucket if it doesn't exist
        BEGIN
            EXECUTE 'SELECT create_bucket(''agency-resources'')';
            RAISE NOTICE 'Created agency-resources bucket';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Agency-resources bucket already exists or could not be created: %', SQLERRM;
        END;
        
        -- Create documents bucket if it doesn't exist
        BEGIN
            EXECUTE 'SELECT create_bucket(''documents'')';
            RAISE NOTICE 'Created documents bucket';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Documents bucket already exists or could not be created: %', SQLERRM;
        END;
        
        -- Set RLS policies for the buckets
        BEGIN
            -- Allow authenticated users to read from resources bucket
            EXECUTE 'SELECT storage.policy.create(
                ''resources'',
                ''authenticated_read'',
                ''SELECT'',
                ''authenticated'',
                ''(bucket_id = ''''resources'''' AND auth.role() = ''''authenticated'''')''
            )';
            
            -- Allow authenticated users to insert into resources bucket
            EXECUTE 'SELECT storage.policy.create(
                ''resources'',
                ''authenticated_insert'',
                ''INSERT'',
                ''authenticated'',
                ''(bucket_id = ''''resources'''' AND auth.role() = ''''authenticated'''')''
            )';
            
            RAISE NOTICE 'Set RLS policies for resources bucket';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not set RLS policies for resources bucket: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Storage extension not available. Buckets must be created through the Supabase dashboard.';
    END IF;
END $$;
