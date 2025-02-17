-- First, ensure the schema cache is cleared
SELECT pg_notify('pgrst', 'reload schema');

-- Temporarily disable RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Drop and recreate indexes to force schema refresh
DROP INDEX IF EXISTS idx_products_published;
DROP INDEX IF EXISTS idx_products_order_index;
DROP INDEX IF EXISTS idx_products_created_at;

CREATE INDEX idx_products_published ON products(published);
CREATE INDEX idx_products_order_index ON products(order_index);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies to ensure they're properly cached
DROP POLICY IF EXISTS "Public can view published products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Public can view published products"
  ON products
  FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Force another schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');