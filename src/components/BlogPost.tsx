import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Clock, Calendar, Tag, Folder, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost as BlogPostType } from '../types';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = React.useState<BlogPostType | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!slug) {
      navigate('/blog');
      return;
    }
    fetchPost();
  }, [slug, navigate]);

  const fetchPost = async () => {
    if (!slug) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          blog_post_categories (
            category:blog_categories (*)
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        console.error('Error fetching post:', error);
        navigate('/blog');
        return;
      }

      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-[400px] object-cover rounded-lg shadow-lg mb-8"
        />

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              {format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </div>
            {post.reading_time && (
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                {post.reading_time} min de lectura
              </div>
            )}
          </div>

          {(post.categories?.length ?? 0) > 0 && (
            <div className="flex items-center mt-4">
              <Folder size={16} className="mr-2 text-gray-600" />
              <div className="flex flex-wrap gap-2">
                {post.categories?.map(category => (
                  <span
                    key={category.id}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(post.tags?.length ?? 0) > 0 && (
            <div className="flex items-center mt-2">
              <Tag size={16} className="mr-2 text-gray-600" />
              <div className="flex flex-wrap gap-2">
                {post.tags?.map(tag => (
                  <span
                    key={tag.id}
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.youtube_url && (
            <div className="mt-6 aspect-video relative">
              <iframe
                src={`https://www.youtube.com/embed/${new URLSearchParams(new URL(post.youtube_url).search).get('v')}?autoplay=1&mute=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full absolute top-0 left-0 rounded-lg"
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;