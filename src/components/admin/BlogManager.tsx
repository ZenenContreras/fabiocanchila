import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, FolderPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost, BlogCategory } from '../../types';
import PostEditor from './PostEditor';
import CategoryManager from './CategoryManager';

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories:blog_post_categories(
            category:blog_categories(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: !post.published })
        .eq('id', post.id);

      if (error) throw error;
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, published: !p.published } : p
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  if (showCategories) {
    return (
      <CategoryManager
        categories={categories}
        onClose={() => {
          setShowCategories(false);
          fetchCategories();
        }}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Primero necesitas crear categorías
        </h3>
        <p className="text-gray-600 mb-8">
          Antes de crear artículos, debes configurar al menos una categoría.
        </p>
        <button
          onClick={() => setShowCategories(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <FolderPlus className="h-5 w-5 mr-2" />
          Crear Categorías
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <PostEditor
        post={selectedPost}
        categories={categories}
        onSave={async () => {
          setIsEditing(false);
          await fetchPosts();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus Posts y categorias
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCategories(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FolderPlus className="h-5 w-5 mr-2 text-gray-500" />
            Gestionar Categorías
          </button>
          <button
            onClick={() => {
              setSelectedPost(null);
              setIsEditing(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Post
          </button>
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Título</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categorías</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {post.title}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {post.categories?.map((cat) => (
                      <span
                        key={cat.category.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {cat.category.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className="text-gray-400 hover:text-gray-500"
                      title={post.published ? 'Despublicar' : 'Publicar'}
                    >
                      {post.published ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setIsEditing(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-400 hover:text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No hay posts aún. ¡Crea el primero!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}