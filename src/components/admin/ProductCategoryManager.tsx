import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProductCategory } from '../../types';

interface ProductCategoryManagerProps {
  categories: ProductCategory[];
  onClose: () => void;
}

export default function ProductCategoryManager({ categories: initialCategories, onClose }: ProductCategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleSave = async (category: Partial<ProductCategory>) => {
    try {
      const slug = category.name?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (editingCategory) {
        const { error } = await supabase
          .from('product_categories')
          .update({ ...category, slug })
          .eq('id', editingCategory.id);

        if (error) throw error;

        setCategories(categories.map(c => 
          c.id === editingCategory.id ? { ...c, ...category, slug } : c
        ));
      } else {
        const { data, error } = await supabase
          .from('product_categories')
          .insert([{ ...category, slug }])
          .select()
          .single();

        if (error) throw error;
        setCategories([...categories, data]);
      }

      setEditingCategory(null);
      setNewCategory({ name: '', description: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onClose}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
        <h2 className="text-2xl font-semibold text-gray-900">Gestionar Categorías de Productos</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={editingCategory ? editingCategory.name : newCategory.name}
              onChange={(e) => {
                if (editingCategory) {
                  setEditingCategory({ ...editingCategory, name: e.target.value });
                } else {
                  setNewCategory({ ...newCategory, name: e.target.value });
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={editingCategory ? editingCategory.description : newCategory.description}
              onChange={(e) => {
                if (editingCategory) {
                  setEditingCategory({ ...editingCategory, description: e.target.value });
                } else {
                  setNewCategory({ ...newCategory, description: e.target.value });
                }
              }}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="flex justify-end space-x-3">
            {editingCategory && (
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => handleSave(editingCategory || newCategory)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
            >
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Categorías Existentes
        </h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descripción</th>
                <th className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {category.description}
                  </td>
                  <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No hay categorías aún. ¡Crea la primera!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}