/*
  # Update tables structure

  1. Changes
    - Add youtube_url to posts table
    - Remove youtube_url and order_index from products table

  2. Validation
    - Add URL validation for youtube_url in posts table
*/

-- Add youtube_url to posts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN youtube_url text;
  END IF;
END $$;

-- Add URL validation for youtube_url in posts
ALTER TABLE posts
ADD CONSTRAINT valid_youtube_url 
CHECK (youtube_url IS NULL OR is_valid_url(youtube_url));

-- Remove columns from products table
ALTER TABLE products 
  DROP COLUMN IF EXISTS youtube_url,
  DROP COLUMN IF EXISTS order_index;