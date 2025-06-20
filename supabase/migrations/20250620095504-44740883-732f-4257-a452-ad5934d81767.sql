
-- Create the app_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'consumer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure user_roles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create the has_role function for RLS policies
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Only try to insert user roles if the user doesn't have any roles yet
INSERT INTO public.user_roles (user_id, role)
SELECT '8b4b7467-12ff-4c39-80bf-cd9123bd6aa6'::uuid, 'consumer'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '8b4b7467-12ff-4c39-80bf-cd9123bd6aa6'::uuid
);

-- Update RLS policies to use the has_role function instead of direct queries
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Admins can manage all products" ON public.products 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage categories" ON public.categories 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));
