
-- Drop all existing policies on both tables
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

-- Create proper policies that allow everyone to view categories and active products
CREATE POLICY "Everyone can view categories" ON public.categories 
FOR SELECT USING (true);

CREATE POLICY "Everyone can view active products" ON public.products 
FOR SELECT USING (is_active = true);

-- Create admin-only policies for management operations (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage categories" ON public.categories 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products" ON public.products 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));
