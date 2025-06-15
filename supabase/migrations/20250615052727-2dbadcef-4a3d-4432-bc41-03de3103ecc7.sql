
-- Add stock column to products table
ALTER TABLE public.products 
ADD COLUMN stock INTEGER DEFAULT 0 NOT NULL;
