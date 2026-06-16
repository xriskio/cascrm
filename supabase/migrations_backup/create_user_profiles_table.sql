-- Create user_profiles table with role field
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
  phone text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create RLS policies

-- Policy for users to view their own profile

-- Policy for users to update their own profile

-- Policy for admins to view all profiles

-- Policy for admins to update all profiles

-- Policy for admins to insert profiles

-- Create function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles (user_id);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON public.user_profiles (role);
