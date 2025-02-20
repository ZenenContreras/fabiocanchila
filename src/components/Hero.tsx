import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Quote, MousePointerClick } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const ValueProposition = [
    {
      id: 'emprendimiento-gestion',     
      title: "Emprendimiento y Gestión para el Desarrollo",
      description: "Asesoro la planificación, ejecución, seguimiento, monitoreo, evaluación y gestión de aprendizajes de actividades para la transformación de realidades territoriales."
    },
    {
      id: 'aumenta-capacidad',
      title: "Aumenta tu capacidad para crear, aportar y capturar valor",
      description: "Aplico metodologías para emprender y hacer brillar tu marca personal."
    },
    {
      id: 'consolida-equipos',
      title: "Consolida Equipos que Garanticen Resultados",
      description: "Facilito la elaboración de planes y estrategias para aumentar el desempeño individual y colectivo hacia el logro de resultados."
    },
    {
      id: 'estandar-profesional',
      title: "Lleva tu estándar profesional al siguiente nivel",
      description: "Guío la elaboración de rutas de aprendizaje para aumentar capacidades para asumir nuevos desafíos profesionales."
    },
    {
      id: 'alianzas-gobernanzas',
      title: "Gestiona Alianzas y Gobernanzas",
      description: "Asesoro el diseño y gestión de alianzas y gobernanzas para el desarrollo."
    },
    {
      id: 'sostenibilidad-esal',
      title: "Sostenibilidad de Organizaciones sin Ánimo de Lucro",
      description: "Facilito la toma de decisiones de las personas basadas en su autoconocimento y proyecto de vida."
    }
  ];

  const testimonials = [
    {
      name: "Juan Carlos Castro",
      role: "Docente e Investigadorl",
      quote: "Con el Canvas del Éxito y la Prosperidad identifiqué oportunidades de emprendimiento que se complementan con mi trabajo actual. Ahora diversifico mis ingresos creando y comercializando productos digitales"
    },
    {
      name: "Juan Zarama",
      role: "Director Estratégico, Corpolonja",
      quote: "Conocer los detalles del libro: Buena Vibra para Vivir con Valentía me dió nuevas perspectivas para conectar el sentido de lo humano con mi desempeño en el trabajo y la conducción de mis negocios"
    },
    {
      name: "Natalia Castillo",
      role: "Médico General",
      quote: "Luego de revisar y actualizar mi definición de metas y propósitos,  logé identificar esas otras cosas que deseo hacer para hallar un equilibrio en mi vida personal, profesional y familiar"
    },
    {
      name: "Jose Romero",
      role: "CEO, CERPAI",
      quote: "Fabio Aporta valor en los espacios que generamos para avanzar hacia la consolidación de la cadena de café en el Cesar, y en la consolidación de CERPAI como espacio de promoción de estándares de calidad"
    }
  ];

  const alliances = [
    {
      name: "Corpoflorentino",
      logo: "/LogoCorpoflorentino.png",
      description: "Alianza estratégica para el desarrollo empresarial"
    },
    {
      name: "EBA Academy",
      logo: "/logo-eba.png",
      description: "Formación ejecutiva de alto nivel"
    },
    {
      name: "Metaverso Estatal",
      logo: "/logo-meta.png",
      description: "Innovación en educación virtual"
    }
  ];

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonialIndex((current) => 
        current === testimonials.length - 1 ? 0 : current + 1
      );
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(testimonialInterval);
  }, []);

  const handleContact = (type: 'email') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (type === 'email') {
      const subject = encodeURIComponent(`Solicitud de cita Personalizada`);
      const body = encodeURIComponent(`Hola, Navegando por internet vi tu pagina y me gustaria obtener mas informacion.`);
      window.location.href = `mailto:fc@fabiocanchila.com?subject=${subject}&body=${body}`;
    }
  };

  return (
    <>
      <div className="relative min-h-[calc(100vh-5rem)] flex items-center">
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-16 pb-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Transforma tus <span className="text-primary">Sueños</span><br />
                en <span className="text-accent">Realidad</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Ayudo a personas y organizaciones a alcanzar su máximo potencial a través del "Canvas del Éxito y la Prosperidad".
              </p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}               
                transition={{ delay:  0.1 }}  
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ">
                
                  <Link
                    to={`/value-proposition/transforma-suenos`}
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-l©g hover:bg-primary-dark transform hover:translate-x-1 "
                  >
                    <MousePointerClick className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                    Ver más
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleContact('email')}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Mail className="h-5 w-5 mr-2 " />
                    Agenda una consulta
                    <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                  </motion.button>

              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0"
            >
              <img
                src="https://media.licdn.com/dms/image/v2/D4E03AQHa3yNiph2JhA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1720208228895?e=1743033600&v=beta&t=ha5UMLDIvjEPSaxokcXCy4KdTh38yxy9BWSWWJzndNk"
                alt="Fabio Canchila"
                className="rounded-2xl object-cover w-full mix-blend-multiply"
                style={{ mixBlendMode: 'multiply' }}
              />
            </motion.div>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </div>

      {/* ValueProposition Section */}
      <section className="py-16 bg-custom-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full">
            {ValueProposition.map((proposition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-primary group"
              >
                <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-primary transition-colors">
                  {proposition.id === 'emprendimiento-gestion' && (
                    <>
                      <span className="text-accent">Emprendimiento</span> y{' '}
                      <span className="text-primary">Gestión</span> para el Desarrollo
                    </>
                  )}
                  {proposition.id === 'aumenta-capacidad' && (
                    <>
                      <span className="text-primary">Aumenta</span> tu capacidad para{' '}
                      <span className="text-accent">crear</span>,{' '}
                      <span className="text-accent">aportar</span> y{' '}
                      <span className="text-accent">capturar</span> valor
                    </>
                  )}
                  {proposition.id === 'consolida-equipos' && (
                    <>
                      <span className="text-accent">Consolida</span> Equipos que{' '}
                      <span className="text-primary">Garanticen</span> Resultados
                    </>
                  )}
                  {proposition.id === 'estandar-profesional' && (
                    <>
                      <span className="text-primary">Lleva</span> tu estándar profesional al{' '}
                      <span className="text-accent">siguiente nivel</span>
                    </>
                  )}
                  {proposition.id === 'alianzas-gobernanzas' && (
                    <>
                      <span className="text-primary">Gestiona</span>{' '}
                      <span className="text-accent">Alianzas</span> y{' '}
                      <span className="text-primary">Gobernanzas</span>
                    </>
                  )}
                  {proposition.id === 'sostenibilidad-esal' && (
                    <>
                      <span className="text-accent">Sostenibilidad</span> de{' '}
                      <span className="text-primary">Organizaciones</span> {' '}
                      <span className="text-accent">Sin</span> Ánimos de Lucro
                    </>
                  )}
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {proposition.description}
                </p>
                <Link
                  to={`/value-proposition/${proposition.id}`}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:bg-primary-dark transform hover:translate-x-1"
                >
                  <MousePointerClick className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  Ver más
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={`${currentTestimonialIndex}-${index}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-white rounded-xl shadow-lg p-8 relative transform hover:-translate-y-1 transition-transform duration-300 ${
                    index === currentTestimonialIndex || 
                    index === (currentTestimonialIndex + 1) % testimonials.length || 
                    index === (currentTestimonialIndex + 2) % testimonials.length 
                      ? 'block' 
                      : 'hidden'
                  }`}
                >
                  <Quote className="absolute text-primary/10 h-16 w-16 -top-2 -left-2 transform -rotate-12" />
                  <div className="relative z-10">
                    <p className="text-gray-700 italic mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t pt-4 border-gray-100">
                      <h3 className="font-semibold text-primary">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Testimonial navigation dots */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonialIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTestimonialIndex
                    ? 'w-6 bg-primary'
                    : 'bg-gray-300 hover:bg-primary/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section - Fixed 3-column layout */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Alianzas Estratégicas
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alliances.map((alliance, index) => (
              <motion.div
                key={alliance.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-4">
                  <img
                    src={alliance.logo}
                    alt={alliance.name}
                    className="h-20 object-contain"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {alliance.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {alliance.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}