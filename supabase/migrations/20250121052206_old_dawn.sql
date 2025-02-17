/*
  # Database Functions and Triggers

  1. Utility Functions
    - Slug generation
    - Reading time calculation
    - URL validation
  
  2. Triggers
    - Automatic timestamp updates
    - Post changes handling
    - Data validation
*/

-- Function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        title,
        '[^a-zA-Z0-9\s-]',
        ''
      ),
      '\s+',
      '-'
    )
  );
END;
$$;

-- Function to estimate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  words_per_minute integer := 200;
  word_count integer;
BEGIN
  -- Estimate word count by counting spaces
  word_count := array_length(regexp_split_to_array(content, '\s+'), 1);
  -- Return reading time in minutes, minimum 1 minute
  RETURN GREATEST(1, CEIL(word_count::float / words_per_minute));
END;
$$;

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updating timestamps
DROP TRIGGER IF EXISTS set_timestamp_posts ON posts;
CREATE TRIGGER set_timestamp_posts
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_timestamp_services ON services;
CREATE TRIGGER set_timestamp_services
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Trigger function to automatically generate slugs and calculate reading time
CREATE OR REPLACE FUNCTION handle_post_changes()
RETURNS trigger AS $$
BEGIN
  -- Generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  
  -- Calculate reading time
  NEW.reading_time := calculate_reading_time(NEW.content);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for posts
DROP TRIGGER IF EXISTS handle_post_changes ON posts;
CREATE TRIGGER handle_post_changes
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION handle_post_changes();

-- Function to validate URLs
CREATE OR REPLACE FUNCTION is_valid_url(url text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
BEGIN
  RETURN url ~ '^https?://[^\s/$.?#].[^\s]*$';
END;
$$;

-- Add check constraints
DO $$ 
BEGIN
  -- Remove existing constraints if they exist
  ALTER TABLE posts DROP CONSTRAINT IF EXISTS valid_cover_image;
  ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_image_url;
  ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_purchase_url;
  
  -- Add new constraints
  ALTER TABLE posts
  ADD CONSTRAINT valid_cover_image
  CHECK (is_valid_url(cover_image));

  ALTER TABLE products
  ADD CONSTRAINT valid_image_url
  CHECK (is_valid_url(image_url));

  ALTER TABLE products
  ADD CONSTRAINT valid_purchase_url
  CHECK (is_valid_url(purchase_url));
END $$;