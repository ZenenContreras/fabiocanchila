/*
  # Update products table URLs

  1. Changes
    - Make ebook_url and physical_url optional
    - Add check constraint to ensure at least one URL is provided

  2. Security
    - Maintain existing RLS policies
*/

-- First remove the existing NOT NULL constraints
ALTER TABLE products 
  ALTER COLUMN ebook_url DROP NOT NULL,
  ALTER COLUMN physical_url DROP NOT NULL;

-- Add check constraint to ensure at least one URL is provided
ALTER TABLE products
  ADD CONSTRAINT at_least_one_url 
  CHECK (
    (ebook_url IS NOT NULL) OR 
    (physical_url IS NOT NULL)
  );

-- Update URL validation constraints to only check when URL is provided
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS valid_ebook_url,
  DROP CONSTRAINT IF EXISTS valid_physical_url;

ALTER TABLE products
  ADD CONSTRAINT valid_ebook_url 
  CHECK (ebook_url IS NULL OR is_valid_url(ebook_url)),
  ADD CONSTRAINT valid_physical_url 
  CHECK (physical_url IS NULL OR is_valid_url(physical_url));