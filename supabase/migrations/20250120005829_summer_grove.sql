/*
  # Add Admin User Configuration

  1. New Tables
    - `admin_config`
      - `id` (uuid, primary key)
      - `admin_email` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Only admin can view and manage
*/

CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view admin config"
  ON admin_config
  FOR SELECT
  USING (auth.jwt() ->> 'email' = admin_email);

CREATE POLICY "Only admin can manage admin config"
  ON admin_config
  USING (auth.jwt() ->> 'email' = admin_email)
  WITH CHECK (auth.jwt() ->> 'email' = admin_email);

-- Function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_config
    WHERE admin_email = auth.jwt() ->> 'email'
  );
END;
$$;