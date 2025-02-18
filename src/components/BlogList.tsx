import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import type { BlogPost, BlogCategory } from '../types';
import { Clock, Calendar } from 'lucide-react';

export default function BlogList() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchPosts();

    const channel = supabase
      .channel('blog_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_categories'
        },
        () => {
          fetchCategories();
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_post_categories'
        },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Sort categories to put selected category first
      const sortedCategories = [...(data || [])].sort((a, b) => {
        if (a.id === selectedCategory) return -1;
        if (b.id === selectedCategory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image,
          published,
          created_at,
          reading_time,
          blog_post_categories (
            category:blog_categories (
              id,
              name,
              slug
            )
          )
        `)
        .eq('published', true);

      if (selectedCategory) {
        query = query.eq('blog_post_categories.category.id', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPosts = data.map(post => ({
        ...post,
        updated_at: post.created_at,
        categories: post.blog_post_categories
          ?.map(bpc => bpc.category)
          .filter(Boolean) || []
      }));

      setPosts(transformedPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('No se pudieron cargar los posts. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories(); // Re-fetch categories to update order
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-custom-gray-light pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-custom-gray-light pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Nuestro Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Descubre las últimas tendencias y consejos sobre estrategia empresarial y desarrollo profesional
          </p>
        </div>

        {/* Categorías con diseño mejorado */}
        <div className="mb-12 sticky top-20 bg-white/80 backdrop-blur-sm py-4 z-10 border-b border-gray-100">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                !selectedCategory
                  ? 'bg-primary text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Posts con Layout Mejorado */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Link to={`/blog/${post.slug}`} className="block h-full">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Categorías sobre la imagen */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {post.categories?.map(category => (
                        <span
                          key={category.id}
                          className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-primary rounded-full shadow-sm"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    {/* Meta información */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-primary" />
                          <time dateTime={post.created_at}>
                            {format(new Date(post.created_at), "d 'de' MMM, yyyy", { locale: es })}
                          </time>
                        </div>
                        {post.reading_time && (
                          <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-primary" />
                            <span>{post.reading_time} min</span>
                          </div>
                        )}
                      </div>
                      <span className="text-primary group-hover:translate-x-1 transition-transform duration-200">
                        Leer más →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay artículos disponibles
              </h3>
              <p className="text-gray-600">
                {selectedCategory 
                  ? 'No hay posts publicados en esta categoría todavía.' 
                  : 'Pronto publicaremos nuevo contenido.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}