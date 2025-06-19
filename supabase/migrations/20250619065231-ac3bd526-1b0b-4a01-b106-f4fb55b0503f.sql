
-- First, let's ensure RLS is properly configured for all tables

-- Enable RLS on all tables that need it
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create new policies
-- Categories: Everyone can view
CREATE POLICY "Everyone can view categories" ON public.categories 
FOR SELECT USING (true);

-- Products: Everyone can view active products
CREATE POLICY "Everyone can view active products" ON public.products 
FOR SELECT USING (is_active = true);

-- Cart items: Users can only access their own
CREATE POLICY "Users can view their own cart items" ON public.cart_items 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON public.cart_items 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON public.cart_items 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON public.cart_items 
FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items: Users can only access their own
CREATE POLICY "Users can view their own wishlist items" ON public.wishlist_items 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist_items 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist_items 
FOR DELETE USING (auth.uid() = user_id);

-- Profiles: Users can only access their own
CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- User roles: Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles 
FOR SELECT USING (auth.uid() = user_id);

-- Admin policies for management
CREATE POLICY "Admins can manage all products" ON public.products 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage categories" ON public.categories 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
