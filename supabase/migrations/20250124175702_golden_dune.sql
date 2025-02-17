/*
  # Update products table structure

  1. Changes
    - Remove old columns: content, price, purchase_url, button_text
    - Add new columns: ebook_url, physical_url
    - Update constraints for new URLs

  2. Security
    - Maintain existing RLS policies
    - Add URL validation for new columns
*/

-- Remove old columns
ALTER TABLE products 
  DROP COLUMN IF EXISTS content,
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS purchase_url,
  DROP COLUMN IF EXISTS button_text;

-- Add new columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS ebook_url text NOT NULL,
  ADD COLUMN IF NOT EXISTS physical_url text NOT NULL;

-- Add URL validation constraints
ALTER TABLE products
  ADD CONSTRAINT valid_ebook_url CHECK (is_valid_url(ebook_url)),
  ADD CONSTRAINT valid_physical_url CHECK (is_valid_url(physical_url));

-- Update existing RLS policies
DROP POLICY IF EXISTS "Public can view published products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Public can view published products"
  ON products
  FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can manage products"
  ON products
  USING (is_admin())
  WITH CHECK (is_admin());