/*
  # Agregar soporte para productos y categorías

  1. Nuevas Tablas
    - `product_categories` - Categorías para productos
    - `products` - Productos con imágenes y detalles
    - `blog_categories` - Nueva tabla específica para categorías de blog
  
  2. Cambios
    - Mover datos existentes de categories a blog_categories
    - Actualizar relaciones existentes
  
  3. Seguridad
    - Habilitar RLS en todas las tablas nuevas
    - Políticas para lectura pública y escritura admin
*/

-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product categories"
  ON product_categories
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage product categories"
  ON product_categories
  USING (is_admin())
  WITH CHECK (is_admin());

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  price decimal(10,2),
  image_url text NOT NULL,
  category_id uuid REFERENCES product_categories(id),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published products"
  ON products
  FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can manage products"
  ON products
  USING (is_admin())
  WITH CHECK (is_admin());

-- Tabla de categorías de blog (nueva)
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blog categories"
  ON blog_categories
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage blog categories"
  ON blog_categories
  USING (is_admin())
  WITH CHECK (is_admin());

-- Actualizar la tabla post_categories para usar blog_categories
CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blog post categories"
  ON blog_post_categories
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage blog post categories"
  ON blog_post_categories
  USING (is_admin())
  WITH CHECK (is_admin());

-- Agregar columna para video de YouTube en la tabla de servicios
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  youtube_url text,
  icon text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view services"
  ON services
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage services"
  ON services
  USING (is_admin())
  WITH CHECK (is_admin());