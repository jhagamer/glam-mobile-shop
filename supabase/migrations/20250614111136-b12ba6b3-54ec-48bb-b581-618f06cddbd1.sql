
-- First, let's find the user ID for the email shopcrimsonhouse@gmail.com and add admin role
-- We'll use the profiles table to find the user and then add the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'shopcrimsonhouse@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = profiles.id AND role = 'admin'
);
