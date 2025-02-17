import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, withRetry } from '../lib/supabase';
import type { Service } from '../types';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface ServicesPageProps {
  showHeading?: boolean;
  maxServices?: number;
}

export default function ServicesPage({ showHeading = true, maxServices }: ServicesPageProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();

    const channel = supabase
      .channel('services_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchServices = async () => {
    try {
      let query = supabase
        .from('services')
        .select('*')
        .order('order_index', { ascending: true });

      if (maxServices) {
        query = query.limit(maxServices);
      }

      const { data, error } = await withRetry(() => query);

      if (error) throw error;
      setServices(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError('No se pudieron cargar los servicios. Por favor, intenta más tarde.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-custom-gray-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-custom-gray-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchServices}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-16 sm:py-20 bg-custom-gray-light ${!showHeading ? 'pt-0' : 'pt-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {showHeading && (
          <div className="text-center mb-12 sm:mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6"
            >
              Servicios Especializados
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Soluciones integrales diseñadas para impulsar tu crecimiento profesional y empresarial, 
              respaldadas por más de 20 años de experiencia en el campo.
            </motion.p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {services.map((service, index) => {
            // @ts-ignore - Lucide icons are dynamically accessed
            const IconComponent = Icons[service.icon] || Icons.Briefcase;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  <div className="text-primary mb-6 w-14 h-14 flex items-center justify-center bg-primary-light/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={28} className="group-hover:text-accent transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg">
                    {service.description}
                  </p>

                  <Link
                    to={`/services/${service.id}`}
                    className="inline-flex items-center text-primary hover:text-primary-dark transition-colors group"
                  >
                    <span className="font-medium">Leer más</span>
                    <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!showHeading && services.length > 0 && (
          <div className="text-center mt-12">
            <motion.a
              href="/services"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Ver todos los servicios
            </motion.a>
          </div>
        )}
      </div>
    </section>
  );
}