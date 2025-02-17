import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Service } from '../../types';
import ServiceEditor from './ServiceEditor';

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setServices(services.filter(service => service.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = services.findIndex(s => s.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === services.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newServices = [...services];
    const [movedService] = newServices.splice(currentIndex, 1);
    newServices.splice(newIndex, 0, movedService);

    // Update order_index for all services
    const updatedServices = newServices.map((service, index) => ({
      ...service,
      order_index: index,
    }));

    try {
      // Update each service individually to maintain all required fields
      for (const service of updatedServices) {
        const { error } = await supabase
          .from('services')
          .update({
            order_index: service.order_index,
            title: service.title,
            description: service.description,
            content: service.content,
            icon: service.icon,
          })
          .eq('id', service.id);

        if (error) throw error;
      }

      setServices(updatedServices);
    } catch (error) {
      console.error('Error reordering services:', error);
    }
  };

  if (isEditing) {
    return (
      <ServiceEditor
        service={selectedService}
        onSave={async () => {
          setIsEditing(false);
          await fetchServices();
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus servicios
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedService(null);
            setIsEditing(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Servicio
        </button>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Orden</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Título</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Video</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {services.map((service, index) => (
              <tr key={service.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>{index + 1}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorder(service.id, 'up')}
                        disabled={index === 0}
                        className={`p-1 ${
                          index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleReorder(service.id, 'down')}
                        disabled={index === services.length - 1}
                        className={`p-1 ${
                          index === services.length - 1
                            ? 'text-gray-300'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900">
                  {service.title}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {service.youtube_url ? (
                    <a
                      href={service.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark"
                    >
                      Ver Video
                    </a>
                  ) : (
                    'Sin video'
                  )}
                </td>
                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setIsEditing(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-400 hover:text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No hay servicios aún. ¡Crea el primero!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}