-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);
CREATE INDEX IF NOT EXISTS idx_services_order_index ON services(order_index);

-- Drop existing materialized view if exists
DROP MATERIALIZED VIEW IF EXISTS public_posts_with_categories;

-- Create materialized view for public blog posts with categories
CREATE MATERIALIZED VIEW IF NOT EXISTS public_posts_with_categories AS
SELECT 
  p.*,
  array_agg(DISTINCT jsonb_build_object(
    'id', bc.id,
    'name', bc.name,
    'slug', bc.slug
  )) as categories
FROM posts p
LEFT JOIN blog_post_categories bpc ON p.id = bpc.post_id
LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
WHERE p.published = true
GROUP BY p.id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_posts_with_categories ON public_posts_with_categories(id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_public_posts_view()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public_posts_with_categories;
  RETURN NULL;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS refresh_posts_view ON posts;
DROP TRIGGER IF EXISTS refresh_posts_view_categories ON blog_post_categories;

-- Create triggers to refresh view when posts or categories change
CREATE TRIGGER refresh_posts_view
AFTER INSERT OR UPDATE OR DELETE
ON posts
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_public_posts_view();

CREATE TRIGGER refresh_posts_view_categories
AFTER INSERT OR UPDATE OR DELETE
ON blog_post_categories
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_public_posts_view();

-- Grant permissions
GRANT SELECT ON public_posts_with_categories TO authenticated;
GRANT SELECT ON public_posts_with_categories TO anon;
GRANT EXECUTE ON FUNCTION refresh_public_posts_view() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_public_posts_view() TO anon;

-- Optimize existing RLS policies with better performance
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
SECURITY DEFINER
STABLE
PARALLEL SAFE
LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_config
    WHERE admin_email = auth.jwt() ->> 'email'
  );
END;
$$;

-- Add caching hint for better performance
ALTER FUNCTION is_admin() SET plan_cache_mode TO force_generic_plan;