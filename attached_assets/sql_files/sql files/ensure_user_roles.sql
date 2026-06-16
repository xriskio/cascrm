-- First, check if any users are missing roles
DO $$
BEGIN
  -- Update any users with null roles to 'user'
  UPDATE users
  SET role = 'user'
  WHERE role IS NULL OR role = '';

  -- Log the update
  RAISE NOTICE 'Updated users with missing roles to default role: user';
END $$;

-- Create a trigger to ensure new users always have a role
CREATE OR REPLACE FUNCTION ensure_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NULL OR NEW.role = '' THEN
    NEW.role := 'user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_role_trigger ON users;

-- Create the trigger
CREATE TRIGGER ensure_user_role_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION ensure_user_role();

-- Log the trigger creation
DO $$
BEGIN
  RAISE NOTICE 'Created trigger to ensure all users have a role';
END $$;
