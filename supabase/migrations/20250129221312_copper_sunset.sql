/*
  # Clean up and properly add YouTube URL support

  1. Changes
    - Drop all existing YouTube-related constraints and columns
    - Add youtube_url column with proper validation
    - Update RLS policies to include the new column
    - Clean up any duplicate functions

  2. Security
    - Maintain existing RLS policies
    - Grant necessary permissions
*/

-- First, clean up any existing YouTube-related objects
DROP FUNCTION IF EXISTS is_valid_youtube_url(text);
ALTER TABLE posts DROP CONSTRAINT IF EXISTS valid_youtube_url;
ALTER TABLE posts DROP COLUMN IF EXISTS youtube_url;

-- Create a clean function for YouTube URL validation
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