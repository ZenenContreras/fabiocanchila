-- First, drop all existing migrations related to products table modifications
DROP MATERIALIZED VIEW IF EXISTS products_view;

-- Recreate products table with all needed columns
CREATE TABLE IF NOT EXISTS products_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  ebook_url text,
  physical_url text,
  youtube_url text,
  published boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT at_least_one_url CHECK (
    (ebook_url IS NOT NULL) OR 
    (physical_url IS NOT NULL)
  ),
  CONSTRAINT valid_image_url CHECK (is_valid_url(image_url)),
  CONSTRAINT valid_ebook_url CHECK (ebook_url IS NULL OR is_valid_url(ebook_url)),
  CONSTRAINT valid_physical_url CHECK (physical_url IS NULL OR is_valid_url(physical_url)),
  CONSTRAINT valid_youtube_url CHECK (youtube_url IS NULL OR is_valid_url(youtube_url))
);

-- Copy data from old table to new table
INSERT INTO products_new (
  id, title, slug, description, image_url, 
  ebook_url, physical_url, youtube_url, published, 
  created_at, updated_at
)
SELECT 
  id, title, slug, description, image_url,
  ebook_url, physical_url, youtube_url, published,
  created_at, updated_at
FROM products;

-- Update order_index based on creation date
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_order
  FROM products_new
)
UPDATE products_new p
SET order_index = np.new_order
FROM numbered_products np
WHERE p.id = np.id;

-- Drop old table and rename new table
DROP TABLE products;
ALTER TABLE products_new RENAME TO products;

-- Add indexes
CREATE INDEX idx_products_published ON products(published);
CREATE INDEX idx_products_order_index ON products(order_index);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Public can view published products"
  ON products
  FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can manage products"
  ON products
  USING (is_admin())
  WITH CHECK (is_admin());

-- Grant permissions
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';