/*
  # Add YouTube URL support to posts table

  1. Changes
    - Add youtube_url column to posts table
    - Add validation function for YouTube URLs
    - Add constraint to ensure valid YouTube URLs

  2. Security
    - Maintain existing RLS policies
    - Grant necessary function permissions
*/

-- Drop existing constraint and column if they exist
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS valid_youtube_url;

ALTER TABLE posts 
DROP COLUMN IF EXISTS youtube_url;

-- Create function to validate YouTube URLs if it doesn't exist
CREATE OR REPLACE FUNCTION is_valid_youtube_url(url text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
BEGIN
  RETURN url IS NULL OR url ~ '^https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+$';
END;
$$;

-- Add youtube_url column with validation
ALTER TABLE posts 
ADD COLUMN youtube_url text;

ALTER TABLE posts
ADD CONSTRAINT valid_youtube_url 
CHECK (is_valid_youtube_url(youtube_url));

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_valid_youtube_url(text) TO authenticated, anon;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';