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
    <div className="min-h-screen bg-custom-gray-light pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre las últimas tendencias y consejos sobre estrategia empresarial y desarrollo profesional
          </p>
        </div>

        {/* Categorías */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 transform hover:scale-105 ${
                !selectedCategory
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-primary hover:text-white'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-primary hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:translate-y-[-4px] transition-all duration-300"
              >
                <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                  <div className="relative h-48">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.categories?.map(category => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <time dateTime={post.created_at}>
                          {format(new Date(post.created_at), "d 'de' MMM, yyyy", { locale: es })}
                        </time>
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{post.reading_time} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No hay posts publicados {selectedCategory ? 'en esta categoría' : 'todavía'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}