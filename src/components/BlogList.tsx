import { useEffect, useState } from 'react';
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
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blog_categories' },
        () => {
          fetchCategories();
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blog_post_categories' },
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
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('No se pudieron cargar las categorías.');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
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
            post_id,
            category_id,
            category:blog_categories (
              id,
              name,
              slug,
              description
            )
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query
          .eq('blog_post_categories.category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedPosts = data.map(post => ({
        ...post,
        updated_at: post.created_at,
        categories: post.blog_post_categories
          ?.map(bpc => bpc.category)
          .filter(Boolean) || []
      }));

      // Filter posts to ensure only those with the selected category are shown
      const filteredPosts = selectedCategory
        ? transformedPosts.filter(post =>
            post.blog_post_categories.some(bpc => bpc.category_id === selectedCategory)
          )
        : transformedPosts;

      setPosts(filteredPosts);
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
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-t-4 border-primary rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Nuestro Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora tendencias, consejos y estrategias para tu crecimiento profesional
          </p>
        </motion.div>

        {/* Categorías - Improved Dropdown */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative max-w-md mx-auto"
          >
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Posts Grid with Enhanced Styling */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                  <div className="relative h-56">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-800 shadow-md">
                      {post.categories?.[0]?.name || 'General'}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-primary" />
                        <time dateTime={post.created_at}>
                          {format(new Date(post.created_at), "d 'de' MMM, yyyy", { locale: es })}
                        </time>
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-primary" />
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

        {/* Pagination (if needed) */}
        {posts.length > 6 && (
          <div className="mt-12 text-center">
            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Ver más
            </button>
          </div>
        )}
      </div>
    </div>
  );
}