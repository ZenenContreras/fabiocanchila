-- Drop all existing constraints and indexes
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_pkey CASCADE;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_slug_key CASCADE;
ALTER TABLE products DROP CONSTRAINT IF EXISTS at_least_one_url CASCADE;
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_image_url CASCADE;
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_ebook_url CASCADE;
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_physical_url CASCADE;
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_youtube_url CASCADE;

DROP INDEX IF EXISTS idx_products_published;
DROP INDEX IF EXISTS idx_products_order_index;
DROP INDEX IF EXISTS idx_products_created_at;

-- Drop and recreate the entire table
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    ebook_url text,
    physical_url text,
    youtube_url text,
    published boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT at_least_one_url CHECK (
        (ebook_url IS NOT NULL) OR 
        (physical_url IS NOT NULL)
    ),
    CONSTRAINT valid_image_url CHECK (is_valid_url(image_url)),
    CONSTRAINT valid_ebook_url CHECK (ebook_url IS NULL OR is_valid_url(ebook_url)),
    CONSTRAINT valid_physical_url CHECK (physical_url IS NULL OR is_valid_url(physical_url)),
    CONSTRAINT valid_youtube_url CHECK (youtube_url IS NULL OR is_valid_url(youtube_url))
);

-- Create indexes
CREATE INDEX idx_products_published ON products(published);
CREATE INDEX idx_products_order_index ON products(order_index);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view published products"
    ON products
    FOR SELECT
    USING (published = true OR is_admin());

CREATE POLICY "Admins can manage products"
    ON products
    FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- Grant permissions
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- Force schema cache refresh multiple times to ensure it takes effect
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_sleep(1);
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_sleep(1);
SELECT pg_notify('pgrst', 'reload schema');