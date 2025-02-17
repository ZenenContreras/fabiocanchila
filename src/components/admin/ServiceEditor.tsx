import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Service } from '../../types';
import * as Icons from 'lucide-react';

interface ServiceEditorProps {
  service?: Service | null;
  onSave: () => void;
  onCancel: () => void;
}

// Lista de iconos disponibles
const availableIcons = {
  Briefcase: Icons.Briefcase,
  Users: Icons.Users,
  Target: Icons.Target,
  Book: Icons.Book,
  BookOpen: Icons.BookOpen,
  Brain: Icons.Brain,
  Building2: Icons.Building2,
  GraduationCap: Icons.GraduationCap,
  Lightbulb: Icons.Lightbulb,
  LineChart: Icons.LineChart,
  Rocket: Icons.Rocket,
  Star: Icons.Star,
  Trophy: Icons.Trophy,
  Heart: Icons.Heart,
  Puzzle: Icons.Puzzle,
};

export default function ServiceEditor({ service, onSave, onCancel }: ServiceEditorProps) {
  const [title, setTitle] = useState(service?.title || '');
  const [description, setDescription] = useState(service?.description || '');
  const [content, setContent] = useState(service?.content || '');
  const [youtubeUrl, setYoutubeUrl] = useState(service?.youtube_url || '');
  const [icon, setIcon] = useState(service?.icon || 'Briefcase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const serviceData = {
        title,
        description,
        content,
        youtube_url: youtubeUrl,
        icon,
        order_index: service?.order_index || 0,
      };

      let result;
      if (service) {
        result = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      onSave();
    } catch (err: any) {
      setError(err.message);
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
          {service ? 'Editar Servicio' : 'Nuevo Servicio'}
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
          <label className="block text-sm font-medium text-gray-700">
            URL del Video de YouTube
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          <p className="mt-1 text-sm text-gray-500">
            Opcional: Agrega un video de YouTube para mostrar al inicio del servicio
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icono
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {Object.entries(availableIcons).map(([name, IconComponent]) => (
              <button
                key={name}
                type="button"
                onClick={() => setIcon(name)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  icon === name
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs font-medium">{name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción Corta
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contenido Detallado
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
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