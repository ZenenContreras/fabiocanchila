/*
  # Fix Posts RLS Policies

  1. Changes
    - Actualiza las políticas de RLS para la tabla posts
    - Permite que los administradores gestionen todos los posts
    - Permite que el público vea los posts publicados

  2. Security
    - Utiliza la función is_admin() para verificar permisos
    - Mantiene la seguridad para operaciones de escritura
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON posts;

-- Crear nuevas políticas
CREATE POLICY "Anyone can view published posts"
  ON posts
  FOR SELECT
  USING (published = true OR is_admin());

CREATE POLICY "Admins can insert posts"
  ON posts
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update posts"
  ON posts
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete posts"
  ON posts
  FOR DELETE
  USING (is_admin());