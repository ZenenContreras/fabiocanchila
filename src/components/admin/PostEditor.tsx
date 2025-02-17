import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost, BlogCategory } from '../../types';
import ImageUpload from './ImageUpload';

interface PostEditorProps {
  post?: BlogPost | null;
  categories: BlogCategory[];
  onSave: () => void;
  onCancel: () => void;
}

export default function PostEditor({ post, categories, onSave, onCancel }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [coverImage, setCoverImage] = useState(post?.cover_image || '');
  const [youtubeUrl, setYoutubeUrl] = useState(post?.youtube_url || '');
  const [published, setPublished] = useState(post?.published || false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    post?.categories?.[0]?.id || categories[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSlug = (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const generateUniqueSlug = async (baseTitle: string): Promise<string> => {
    if (!baseTitle.trim()) {
      throw new Error('El título es requerido para generar el slug');
    }

    const baseSlug = generateSlug(baseTitle);
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const query = supabase
        .from('posts')
        .select('id')
        .eq('slug', slug);

      if (post?.id) {
        query.neq('id', post.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      if (!data) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    return slug;
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('El título es requerido');
      return false;
    }
    if (!selectedCategory) {
      setError('Debes seleccionar una categoría');
      return false;
    }
    if (!coverImage) {
      setError('La imagen de portada es requerida');
      return false;
    }
    if (!excerpt.trim()) {
      setError('El extracto es requerido');
      return false;
    }
    if (!content.trim()) {
      setError('El contenido es requerido');
      return false;
    }
    if (youtubeUrl && !youtubeUrl.match(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+$/)) {
      setError('La URL de YouTube no es válida');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const slug = await generateUniqueSlug(title);

      const postData = {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt.trim(),
        cover_image: coverImage,
        published,
      };

      // Only include youtube_url if it's provided
      if (youtubeUrl) {
        Object.assign(postData, { youtube_url: youtubeUrl });
      }

      let postId: string;
      
      if (post?.id) {
        const { data: updatedPost, error: updateError } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', post.id)
          .select()
          .single();

        if (updateError) throw updateError;
        if (!updatedPost) throw new Error('No se pudo actualizar el post');
        
        postId = post.id;

        const { error: deleteError } = await supabase
          .from('blog_post_categories')
          .delete()
          .eq('post_id', postId);

        if (deleteError) throw deleteError;
      } else {
        const { data: newPost, error: insertError } = await supabase
          .from('posts')
          .insert([postData])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newPost) throw new Error('No se pudo crear el post');
        
        postId = newPost.id;
      }

      if (!postId || !selectedCategory) {
        throw new Error('Error al procesar la categoría del post');
      }

      const { error: linkError } = await supabase
        .from('blog_post_categories')
        .insert([{
          post_id: postId,
          category_id: selectedCategory
        }]);

      if (linkError) throw linkError;

      onSave();
    } catch (err: any) {
      console.error('Error saving post:', err);
      setError(err.message || 'Error al guardar el post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {post ? 'Editar Post' : 'Nuevo Post'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de Portada
          </label>
          <ImageUpload
            onImageUploaded={setCoverImage}
            currentImage={coverImage}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL de YouTube
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Opcional: Agrega un video de YouTube relacionado con el artículo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Extracto
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contenido
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Publicar inmediatamente
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}