/*
  # Enhanced Blog Features Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)

    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamp)

    - `post_categories`
      - `post_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)

    - `post_tags`
      - `post_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)

  2. Changes to Posts Table
    - Add `content_html` for rich text storage
    - Add `meta_description` for SEO
    - Add `meta_keywords` for SEO
    - Add `reading_time` for estimated reading time

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and public access
*/

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories"
  ON categories
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags"
  ON tags
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON tags
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');

-- Post Categories Junction Table
CREATE TABLE IF NOT EXISTS post_categories (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view post categories"
  ON post_categories
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage post categories"
  ON post_categories
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');

-- Post Tags Junction Table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view post tags"
  ON post_tags
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Admins can manage post tags"
  ON post_tags
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');

-- Add new columns to posts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'content_html'
  ) THEN
    ALTER TABLE posts ADD COLUMN content_html text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE posts ADD COLUMN meta_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE posts ADD COLUMN meta_keywords text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reading_time'
  ) THEN
    ALTER TABLE posts ADD COLUMN reading_time integer DEFAULT 0;
  END IF;
END $$;