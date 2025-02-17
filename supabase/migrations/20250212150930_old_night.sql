/*
  # Add ordering capability to products

  1. Changes
    - Add order_index column to products table
    - Update existing products with sequential order
    - Add index for better performance

  2. Notes
    - Default order is based on creation date
    - Lower index values appear first
*/

-- Add order_index column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Update existing products to have sequential order_index values
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_order
  FROM products
)
UPDATE products p
SET order_index = np.new_order
FROM numbered_products np
WHERE p.id = np.id;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_order_index ON products(order_index);