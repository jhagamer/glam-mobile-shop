
-- Insert sample beauty/cosmetics categories
INSERT INTO public.categories (name) VALUES
  ('Face Makeup'),
  ('Eye Makeup'),
  ('Lip Products'),
  ('Skincare'),
  ('Hair Care'),
  ('Fragrances'),
  ('Nail Care'),
  ('Body Care')
ON CONFLICT DO NOTHING;
