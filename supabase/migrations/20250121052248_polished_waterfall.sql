/*
  # Storage Configuration and Policies

  1. Storage Setup
    - Create images bucket
    - Configure public access
  
  2. Storage Policies
    - Public read access
    - Authenticated user upload permissions
    - Image cleanup functionality
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Policy for public access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (LOWER(RIGHT(name, 4)) IN ('.png', '.jpg', 'jpeg', '.gif'))
  AND LENGTH(name) < 5242880 -- 5MB limit
);

-- Policy for authenticated users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'images' AND owner = auth.uid());

-- Policy for authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());

-- Create function to handle image cleanup
CREATE OR REPLACE FUNCTION handle_storage_cleanup()
RETURNS trigger AS $$
BEGIN
  -- Delete old image if it exists and is from our bucket
  IF OLD.image_url LIKE 'https://%/storage/v1/object/public/images/%' THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'images'
    AND name = SUBSTRING(OLD.image_url FROM '/images/(.*)$');
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS cleanup_product_image ON products;

-- Create trigger for image cleanup
CREATE TRIGGER cleanup_product_image
  AFTER DELETE OR UPDATE OF image_url
  ON products
  FOR EACH ROW
  WHEN (OLD.image_url IS NOT NULL)
  EXECUTE FUNCTION handle_storage_cleanup();