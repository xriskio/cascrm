-- Grant admin privileges to wael@casurance.com
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- First, find the user ID for wael@casurance.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'wael@casurance.com';
  
  IF user_id IS NOT NULL THEN
    -- Update the role in the users table if it exists
    UPDATE public.users 
    SET role = 'admin' 
    WHERE id = user_id;
    
    -- If no rows were affected, the user might be in user_profiles instead
    IF NOT FOUND THEN
      UPDATE public.user_profiles 
      SET role = 'admin' 
      WHERE user_id = user_id;
    END IF;
    
    RAISE NOTICE 'Admin privileges granted to wael@casurance.com';
  ELSE
    RAISE NOTICE 'User wael@casurance.com not found';
  END IF;
END $$;
