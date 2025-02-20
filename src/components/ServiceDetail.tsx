import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle  } from 'lucide-react';
import { supabase, withRetry } from '../lib/supabase';
import type { Service } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await withRetry(() =>
        supabase.from('services').select('*').eq('id', id).single()
      );

      if (error) throw error;
      if (!data) {
        navigate('/services');
        return;
      }

      setService(data);
    } catch (err) {
      console.error('Error fetching service:', err);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (type: 'email' | 'whatsapp') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!service) return;

    if (type === 'email') {
      const subject = encodeURIComponent(`Solicitud de cita: ${service.title}`);
      const body = encodeURIComponent(`Hola, me interesa agendar una cita para el servicio de ${service.title}.`);
      window.location.href = `mailto:fc@fabiocanchila.com?subject=${subject}&body=${body}`;
    } else {
      const message = encodeURIComponent(`Hola, me interesa el servicio de ${service.title}. Me gustaría obtener más información.`);
      window.open(`https://wa.me/573103688201?text=${message}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {service.title}
            </h1>

            {service.youtube_url && (
              <div className="video-responsive mb-8 aspect-video relative">
                <iframe
                  src={`https://www.youtube.com/embed/${new URLSearchParams(new URL(service.youtube_url).search).get('v')}?autoplay=1&mute=1&loop=1&playlist=${new URLSearchParams(new URL(service.youtube_url).search).get('v')}&rel=0&related=0&modestbranding=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full absolute top-0 left-0 rounded-lg"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-700 mb-8">
              {service.content}
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContact('email')}
                  className="flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  <span>Gestionar Cita</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContact('whatsapp')}
                  className="flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span>Consultar por WhatsApp</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </article>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}