import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import ProductEditor from './ProductEditor';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: !product.published })
        .eq('id', product.id);

      if (error) throw error;
      
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = products.findIndex(p => p.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === products.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentProduct = products[currentIndex];
    const swapProduct = products[newIndex];

    try {
      // Update both products' order_index values
      const { error: error1 } = await supabase
        .from('products')
        .update({ order_index: swapProduct.order_index })
        .eq('id', currentProduct.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('products')
        .update({ order_index: currentProduct.order_index })
        .eq('id', swapProduct.id);

      if (error2) throw error2;

      await fetchProducts();
    } catch (error) {
      console.error('Error reordering products:', error);
    }
  };

  if (isEditing) {
    return (
      <ProductEditor
        product={selectedProduct}
        onSave={async () => {
          setIsEditing(false);
          await fetchProducts();
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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600 mb-4">
          <p>Error: {error}</p>
        </div>
        <div className="text-center">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Publicaciones</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus libros y publicaciones
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsEditing(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Publicación
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay publicaciones
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza creando tu primera publicación
          </p>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsEditing(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Publicación
          </button>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Orden</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Título</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{index + 1}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleReorder(product.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 ${
                            index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReorder(product.id, 'down')}
                          disabled={index === products.length - 1}
                          className={`p-1 ${
                            index === products.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="text-gray-500 truncate max-w-md">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleTogglePublish(product)}
                        className={`text-sm font-medium ${
                          product.published
                            ? 'text-yellow-600 hover:text-yellow-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {product.published ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditing(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}