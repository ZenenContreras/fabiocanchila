-- Add new columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS youtube_url text;

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