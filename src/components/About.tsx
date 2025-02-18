import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Youtube, Award, Users, Target, Briefcase } from 'lucide-react';

export default function About() {
  const achievements = [
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "20+ Años de Experiencia",
      description: "Trayectoria profesional dedicada al desarrollo de capacidades y fortalecimiento organizacional"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Canvas del Éxito",
      description: "Creador de una metodología única para estructurar y planificar metas personales y profesionales"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Impacto Transformador",
      description: "Miles de personas y organizaciones transformadas a través de consultoría y coaching"
    },
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "Consultor Especializado",
      description: "Experto en desarrollo empresarial, innovación y gestión del cambio"
    }
  ];

  const books = [
    {
      title: "Canvas del Éxito y la Prosperidad",
      description: "Trabaja por la vida que quieres y mereces",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80"
    },
    {
      title: "Buena vibra para vivir con valentía",
      description: "Ideas para la cotidianidad y el trabajo",
      image: "https://images.unsplash.com/photo-1544716279-e514082b5582?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-28">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-primary/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Fabio Canchila
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
                Ingeniero industrial especializado en desarrollo de capacidades para el emprendimiento, 
                crecimiento personal y fortalecimiento organizacional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="https://www.youtube.com/@fabiocanchila"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Youtube className="h-5 w-5 mr-2" />
                  Canal de YouTube
                </a>
                <a
                  href="/products"
                  className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Mis Libros
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0"
            >
              <img
                src="https://media.licdn.com/dms/image/v2/D4E03AQHa3yNiph2JhA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1720208228895?e=1743033600&v=beta&t=ha5UMLDIvjEPSaxokcXCy4KdTh38yxy9BWSWWJzndNk"
                alt="Fabio Canchila"
                className="rounded-2xl shadow-2xl aspect-square object-cover w-full mix-blend-multiply transform hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logros Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                  {achievement.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 text-base sm:text-lg">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Canvas del Éxito Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Canvas del Éxito y la Prosperidad
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Una herramienta innovadora diseñada para ayudarte a estructurar y planificar 
              tus metas en todas las áreas de tu vida: personal, profesional y familiar.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {['Personal', 'Profesional', 'Familiar'].map((area, index) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                  Área {area}
                </h3>
                <p className="text-gray-600 text-base sm:text-lg">
                  Desarrolla estrategias efectivas para alcanzar tus objetivos en el ámbito {area.toLowerCase()}, 
                  con un enfoque práctico y resultados medibles.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Libros Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Publicaciones
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Descubre mis libros, donde comparto conocimientos y experiencias para 
              ayudarte en tu camino hacia el éxito.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {books.map((book, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="sm:flex">
                  <div className="sm:flex-shrink-0">
                    <img
                      className="h-48 w-full sm:w-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      src={book.image}
                      alt={book.title}
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-base sm:text-lg">
                      {book.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiencia Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8">
              Trayectoria Profesional
            </h2>
            <div className="text-base sm:text-lg text-gray-600 space-y-6">
              <p>
                Como ingeniero industrial con más de dos décadas de experiencia, me he especializado 
                en ayudar a personas, empresas e instituciones a alcanzar sus objetivos mediante 
                herramientas prácticas y estrategias bien definidas.
              </p>
              <p>
                Mi enfoque se centra en el desarrollo de capacidades para el emprendimiento, 
                el crecimiento personal y el fortalecimiento organizacional. A través de mi trabajo 
                como consultor y conferencista, he tenido el privilegio de impactar positivamente 
                en la vida de numerosas personas y organizaciones.
              </p>
              <p>
                Además de mi labor como consultor, comparto regularmente contenido educativo 
                y motivacional en mi canal de YouTube, donde abordo temas relacionados con el 
                desarrollo personal, la productividad, el liderazgo y la gestión del cambio.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}