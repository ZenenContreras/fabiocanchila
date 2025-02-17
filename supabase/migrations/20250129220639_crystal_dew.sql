/*
  # Fix posts table structure

  1. Changes
    - Ensure youtube_url column exists in posts table
    - Refresh schema cache
*/

-- Drop existing constraint if it exists
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS valid_youtube_url;

-- Recreate youtube_url column to ensure it exists
ALTER TABLE posts 
DROP COLUMN IF EXISTS youtube_url;

ALTER TABLE posts 
ADD COLUMN youtube_url text;

-- Add URL validation for youtube_url
ALTER TABLE posts
ADD CONSTRAINT valid_youtube_url 
CHECK (youtube_url IS NULL OR is_valid_url(youtube_url));

-- Force schema refresh
NOTIFY pgrst, 'reload schema';