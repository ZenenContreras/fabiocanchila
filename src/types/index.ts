export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_html?: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image: string;
  meta_description?: string;
  meta_keywords?: string[];
  reading_time?: number;
  youtube_url?: string;
  categories?: BlogCategory[];
  tags?: Tag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  ebook_url?: string | null;
  physical_url?: string | null;
  youtube_url?: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  content: string;
  youtube_url?: string;
  icon: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}