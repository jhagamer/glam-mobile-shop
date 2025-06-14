
-- First, remove all admin roles from the user_roles table
DELETE FROM public.user_roles 
WHERE role = 'admin';

-- Then add the admin role specifically for the shopcrimsonhouse@gmail.com email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'shopcrimsonhouse@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = profiles.id AND role = 'admin'
);
