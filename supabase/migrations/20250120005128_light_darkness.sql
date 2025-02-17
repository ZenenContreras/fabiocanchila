/*
  # Blog Schema Setup

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `published` (boolean)
      - `cover_image` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
  2. Security
    - Enable RLS on `posts` table
    - Add policies for:
      - Public read access to published posts
      - Admin write access to all posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  published boolean DEFAULT false,
  cover_image text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published posts
CREATE POLICY "Public can view published posts"
  ON posts
  FOR SELECT
  USING (published = true);

-- Policy for admin write access
CREATE POLICY "Admins can manage all posts"
  ON posts
  TO authenticated
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');