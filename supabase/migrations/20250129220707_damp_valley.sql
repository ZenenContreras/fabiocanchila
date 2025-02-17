/*
  # Fix posts table youtube_url column

  1. Changes
    - Drop and recreate youtube_url column with proper constraints
    - Add validation for YouTube URLs specifically
    - Force schema cache refresh
*/

-- Drop existing constraint if it exists
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS valid_youtube_url;

-- Recreate youtube_url column
ALTER TABLE posts 
DROP COLUMN IF EXISTS youtube_url CASCADE;

ALTER TABLE posts 
ADD COLUMN youtube_url text;

-- Create function to validate YouTube URLs
CREATE OR REPLACE FUNCTION is_valid_youtube_url(url text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN url IS NULL OR url ~ '^https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+$';
END;
$$;

-- Add YouTube URL specific validation
ALTER TABLE posts
ADD CONSTRAINT valid_youtube_url 
CHECK (is_valid_youtube_url(youtube_url));

-- Force schema refresh
NOTIFY pgrst, 'reload schema';

-- Grant necessary permissions
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;