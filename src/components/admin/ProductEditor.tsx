import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import ImageUpload from './ImageUpload';

interface ProductEditorProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductEditor({ product, onSave, onCancel }: ProductEditorProps) {
  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [ebookUrl, setEbookUrl] = useState(product?.ebook_url || '');
  const [physicalUrl, setPhysicalUrl] = useState(product?.physical_url || '');
  const [published, setPublished] = useState(product?.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!title.trim()) {
      setError('El título es requerido');
      return false;
    }
    if (!description.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    if (!imageUrl) {
      setError('La imagen es requerida');
      return false;
    }
    if (!ebookUrl && !physicalUrl) {
      setError('Debe proporcionar al menos una URL (Ebook o Libro Físico)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const productData = {
        title: title.trim(),
        slug,
        description: description.trim(),
        image_url: imageUrl,
        ebook_url: ebookUrl || null,
        physical_url: physicalUrl || null,
        published
      };

      if (product) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);

        if (insertError) throw insertError;
      }

      onSave();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onCancel}
            className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Editar Publicación' : 'Nueva Publicación'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {product ? 'Modifica los detalles de la publicación' : 'Crea una nueva publicación'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Ingresa el título de la publicación"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de Portada
          </label>
          <ImageUpload
            onImageUploaded={setImageUrl}
            currentImage={imageUrl}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Describe brevemente la publicación"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Ebook
            </label>
            <input
              type="url"
              value={ebookUrl}
              onChange={(e) => setEbookUrl(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="https://"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Libro Físico
            </label>
            <input
              type="url"
              value={physicalUrl}
              onChange={(e) => setPhysicalUrl(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="https://"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Publicar inmediatamente
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}