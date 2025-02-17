/*
  # Fix products table structure

  1. Changes
    - Add order_index column to products table
    - Add youtube_url column to products table
    - Update existing products with sequential order_index values
    - Add URL validation for youtube_url

  2. Notes
    - Ensures backwards compatibility
    - Maintains data integrity
    - Adds proper constraints
*/

-- Drop existing constraints if they exist
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS valid_youtube_url;

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE products ADD COLUMN order_index integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE products ADD COLUMN youtube_url text;
  END IF;
END $$;

-- Add URL validation for youtube_url
ALTER TABLE products
ADD CONSTRAINT valid_youtube_url 
CHECK (youtube_url IS NULL OR is_valid_url(youtube_url));

-- Update existing products to have sequential order_index values
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_order
  FROM products
)
UPDATE products p
SET order_index = np.new_order
FROM numbered_products np
WHERE p.id = np.id;