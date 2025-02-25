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

-- Crear la tabla de roles si no existe
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Habilitar RLS en la tabla de roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Crear política para que los usuarios puedan ver sus propios roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Asignar rol de administrador a tu usuario (reemplaza USER_ID con tu ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU_ID_AQUI', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Crear la tabla de libros si no existe
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en la tabla de libros
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Crear política para que los administradores puedan gestionar libros
CREATE POLICY "Admins can manage books"
ON public.books
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Crear la tabla de tokens de acceso si no existe
CREATE TABLE IF NOT EXISTS public.secure_access_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    book_id UUID REFERENCES public.books(id) NOT NULL,
    token TEXT DEFAULT encode(gen_random_bytes(32), 'hex') NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Habilitar RLS en la tabla de tokens
ALTER TABLE public.secure_access_tokens ENABLE ROW LEVEL SECURITY;

-- Crear política para que los administradores puedan gestionar tokens
CREATE POLICY "Admins can manage access tokens"
ON public.secure_access_tokens
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Crear política para el bucket de storage
CREATE POLICY "Admins can manage secure books"
ON storage.objects
FOR ALL
USING (
    bucket_id = 'secure-books' 
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);