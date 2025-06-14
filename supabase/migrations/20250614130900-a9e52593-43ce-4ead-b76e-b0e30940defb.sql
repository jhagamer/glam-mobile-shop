
-- Add a unique constraint to ensure only one admin can exist
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_admin_role 
EXCLUDE (role WITH =) 
WHERE (role = 'admin');

-- Create a function to check if admin slot is available
CREATE OR REPLACE FUNCTION public.is_admin_slot_available()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE role = 'admin'
  );
$$;
