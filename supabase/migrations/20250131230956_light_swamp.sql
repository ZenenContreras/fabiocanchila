-- First, ensure we clean up any existing constraints
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS valid_youtube_url;

-- Drop columns if they exist to ensure clean state
ALTER TABLE products 
DROP COLUMN IF EXISTS order_index CASCADE;

ALTER TABLE products 
DROP COLUMN IF EXISTS youtube_url CASCADE;

-- Add columns fresh
ALTER TABLE products
ADD COLUMN order_index integer DEFAULT 0,
ADD COLUMN youtube_url text;

-- Add URL validation
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

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';