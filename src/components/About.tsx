import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Youtube, Target, Users, Briefcase, LineChart, Building2, HandshakeIcon, Brain, Rocket, Trophy, Star, Heart } from 'lucide-react';

export default function About() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const personalInfo = {
    whoAmI: {
      title: "Quién soy",
      items: [
        "Hijo agradecido",
        "Papá amoroso",
        "Hermano orgulloso",
        "Esposo enamorado",
        "Profesional exitoso",
        "Emprendedor entusiasta",
        "Apicultor apasionado",
        "Cocinero sin recetas",
        "Aficionado al camping y los deportes extremos"
      ]
    },
    whatIWant: {
      title: "Qué quiero",
      items: [
        "Generar bienestar para mí y mi familia",
        "Ayudar a las personas a crecer y desarrollarse",
        "Ayudar a equipos de trabajo a mejorar su desempeño",
        "Aprender nuevas ciencias y saberes"
      ]
    },
    whatIDo: {
      title: "Qué hago",
      items: [
        "Escribo libros y guías",
        "Facilito metodologías",
        "Apoyo a personas en la formulación y armonización de sus proyectos de vida personal, profesional y familiar",
        "Asesoro entidades, empresas y organizaciones",
        "Diseño estrategias, programas y proyectos",
        "Desde los inicios de mi vida profesional, genero y aporto valor para el desarrollo sostenible y la construcción de la paz"
      ]
    }
  };

  const professionalSections = {
    expertise: {
      title: "Áreas de Expertise",
      items: [
        { text: "Desarrollo Organizacional", icon: Building2 },
        { text: "Gestión del Cambio", icon: Rocket },
        { text: "Liderazgo Estratégico", icon: Target },
        { text: "Desarrollo Sostenible", icon: Star },
        { text: "Construcción de Paz", icon: HandshakeIcon },
        { text: "Gestión de Proyectos", icon: LineChart }
      ]
    },
    methodology: {
      title: "Metodología",
      items: [
        { text: "Canvas del Éxito y la Prosperidad", icon: Brain },
        { text: "Consultoría Estratégica", icon: Target },
        { text: "Desarrollo de Capacidades", icon: Users },
        { text: "Gestión del Conocimiento", icon: BookOpen },
        { text: "Innovación Social", icon: Rocket },
        { text: "Medición de Impacto", icon: LineChart }
      ]
    },
    achievements: {
      title: "Logros Destacados",
      items: [
        { text: "Dirección de Programas Internacionales", icon: Trophy },
        { text: "Liderazgo de Equipos Multiculturales", icon: Users },
        { text: "Gestión de Alianzas Estratégicas", icon: HandshakeIcon },
        { text: "Desarrollo de Metodologías Innovadoras", icon: Brain },
        { text: "Implementación de Proyectos de Alto Impacto", icon: Star },
        { text: "Transformación Organizacional", icon: Building2 }
      ]
    }
  };

  return (
    <div className="min-h-screen pt-22 pb-16">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-primary/10 to-white pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Fabio Canchila
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Consultor senior con más de 22 años de experiencia en desarrollo organizacional, 
                gestión estratégica y liderazgo de programas de alto impacto.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a
                  href="https://www.youtube.com/@fabiocanchila"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105"
                >
                  <Youtube className="h-5 w-5 mr-2" />
                  Recursos y Conferencias
                </a>
                <a
                  href="/products"
                  className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Publicaciones
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://media.licdn.com/dms/image/v2/D4E03AQHa3yNiph2JhA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1720208228895?e=1743033600&v=beta&t=ha5UMLDIvjEPSaxokcXCy4KdTh38yxy9BWSWWJzndNk"
                alt="Fabio Canchila"
                className="w-full max-w-md mx-auto object-cover"
                style={{ mixBlendMode: 'multiply' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personal Information Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(personalInfo).map(([key, section], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="relative p-8">
                  <div className="flex items-center mb-6">
                    {index === 0 ? (
                      <Heart className="h-8 w-8 text-primary mr-3 group-hover:text-accent transition-colors" />
                    ) : index === 1 ? (
                      <Target className="h-8 w-8 text-primary mr-3 group-hover:text-accent transition-colors" />
                    ) : (
                      <Star className="h-8 w-8 text-primary mr-3 group-hover:text-accent transition-colors" />
                    )}
                    <h3 className="text-2xl font-bold text-primary group-hover:text-accent transition-colors">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {section.items.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex items-start text-gray-700 leading-relaxed group/item hover:text-primary transition-colors"
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 group-hover/item:bg-primary/20 mr-3 flex-shrink-0 transition-colors">
                          <span className="w-2 h-2 rounded-full bg-primary group-hover/item:bg-accent transition-colors" />
                        </span>
                        <span className="text-base">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {Object.entries(professionalSections).map(([key, value]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedSection(selectedSection === key ? null : key)}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedSection === key
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-primary/10'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {value.title}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedSection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {professionalSections[selectedSection as keyof typeof professionalSections].items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Icon className="h-8 w-8 text-primary mb-4" />
                      <p className="text-gray-700 font-medium">{item.text}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedSection && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 text-lg"
            >
              Explore mis áreas de especialización y logros profesionales
            </motion.p>
          )}
        </div>
      </section>

      {/* Professional Experience Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Trayectoria Profesional
            </h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-primary">
                  Liderazgo y Dirección
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  He liderado procesos estratégicos de desarrollo organizacional, sostenibilidad 
                  y construcción de paz en colaboración con organizaciones internacionales, 
                  entidades gubernamentales y empresas multinacionales.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-primary">
                  Competencias Clave
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Gestión Estratégica</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                        Desarrollo e implementación de estrategias organizacionales
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                        Gestión de programas de alto impacto
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Liderazgo</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                        Dirección de equipos multidisciplinarios
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                        Desarrollo de alianzas estratégicas
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-primary">
                  Impacto y Resultados
                </h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                    Diseño e implementación de metodologías innovadoras para el desarrollo organizacional
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                    Creación y gestión de alianzas estratégicas multisectoriales
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                    Desarrollo de programas de transformación organizacional y gestión del cambio
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}