import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, MessageCircle, Mail, ExternalLink, Calendar, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/auth/AuthModal';

interface Resource {
  type: 'book' | 'course' | 'program' | 'whatsapp' | 'contact' | 'masterclass';
  title: string;
  link?: string;
  image?:string;
  status?: 'available' | 'coming-soon' | 'draft';
  description?: string;
}

interface ValueProposition {
  id: string;
  title: string;
  description: string;
  youtubeUrl?: string;
  resources: Resource[];
}

const VALUE_PROPOSITIONS: Record<string, ValueProposition> = {
  'transforma-suenos': {
    id: 'transforma-suenos',
    title: 'Transforma tus Sueños en Realidad',
    description: 'Ayudo a personas y organizaciones a alcanzar su máximo potencial a través del "Canvas del Éxito y la Prosperidad".',
    youtubeUrl: 'https://youtu.be/VmK8RnGtcG4?si=crCXCcdE0ecMlyNh',
    resources: [
      {
        type: 'book',
        title: 'Libro Canvas del Éxito y la Prosperidad',
        link: 'https://go.hotmart.com/Q97401255X?dp=1',
        status: 'available',
        image: '/CanvasPortada.jpg'
      },
      {
        type: 'course',
        title: 'Curso: Transformación Personal',
        link: 'https://go.hotmart.com/W96797334T?dp=1',
        status: 'available',
        image: '/Curso_CanvasDelExito.png'
      },
      {
        type: 'course',
        title: 'Programa para el Éxito y la Prosperidad',
        link: 'https://go.hotmart.com/N96879618G?dp=1',
        status: 'available',
        image: '/ProgramaE&P.jpg'
      },
      {
        type: 'contact',
        title: 'Conferencias, Seminarios y Talleres',
        description: 'Agenda una sesión para discutir tus necesidades específicas'
      }
    ]
  },
  'emprendimiento-gestion': {
    id: 'emprendimiento-gestion',
    title: 'Emprendimiento y Gestión para el Desarrollo',
    description: 'Asesoro la planificación, ejecución, seguimiento, monitoreo, evaluación y gestión de aprendizajes de actividades para la transformación de realidades territoriales',
    youtubeUrl: 'https://youtu.be/DGzi_-nHT-w?si=kBy60YrlR2ipjBRY',
    resources: [
      {
        type: 'contact',
        title: 'Servicios Profesionales',
        description: 'Estoy listo para aportar mis capacidades y experiencias, agregar valor, y avanzar juntos hacia el logro de resultados.'
      }
    ]
  },
  'aumenta-capacidad': {
    id: 'aumenta-capacidad',
    title: 'Aumenta tu capacidad para crear, aportar y capturar valor',
    description: 'Aplico metodologías para emprender y hacer brillar tu marca personal',
    youtubeUrl: 'https://youtu.be/pKdIK_8HoO8?si=iDnmQVq3_ssjOSo8',
    resources: [
      {
        type: 'book',
        title: 'Libro: Buena Vibra Para Vivir Con Valentia',
        link: 'https://go.hotmart.com/D97400047L?dp=1',
        status: 'available',
        image: '/buenavibraPortada.png'
      },
      {
        type: 'course',
        title: 'Programa 2025 Emprendedores y Empresarios',
        link: 'https://go.hotmart.com/U97908607I?dp=1',
        status: 'available',
        image: '/ProgramaMentalidad.jpeg'
      },
      {
        type: 'book',
        title: 'Libro: TIP',
        status: 'draft',
        description: 'En desarrollo'
      },
      {
        type: 'whatsapp',
        title: 'Grupo de Emprendimiento',
        link: 'https://chat.whatsapp.com/H7Dfe8pLwNB8GznPYpKqvs',
        status: 'available'
      },
      {
        type: 'contact',
        title: 'Asesoría Personalizada',
        description: 'Agenda una sesión de consultoría individual'
      }
    ]
  },
  'consolida-equipos': {
    id: 'consolida-equipos',
    title: 'Consolida Equipos que Garanticen Resultados',
    description: 'Facilito la elaboración de planes y estrategias para aumentar el desempeño individual y colectivo hacia el logro de resultados',
    youtubeUrl: 'https://youtu.be/wJ9pX5M-Ugo?si=2iOOsfiYCcRWnkuU',
    resources: [
      {
        type: 'book',
        title: 'Libro: Consolida y Dirigue Equipos Que Garanticen Resultados',
        link: 'https://go.hotmart.com/X97279249D?dp=1',
        status: 'available',
        image: '/consolidaequiposPortada.png'
      },
      {
        type: 'course',
        title: 'Curso: Consolida y Dirigue Equipos Que Garanticen Resultados',
        link: 'https://go.hotmart.com/V97490299M?dp=1',
        status: 'available',
        image: '/Curso_ConsolidaYDirigeEquipos.jpeg'
      },
      {
        type: 'course',
        title: 'Programa 2025 Emprendedores y Empresarios',
        link: 'https://go.hotmart.com/U97908607I?dp=1',
        status: 'available',
        image: '/ProgramaMentalidad.jpeg'
      },
      {
        type: 'whatsapp',
        title: 'Grupo de Emprendimiento',
        link: 'https://chat.whatsapp.com/H7Dfe8pLwNB8GznPYpKqvs',
        status: 'available'
      },
      {
        type: 'contact',
        title: 'Talleres Personalizados',
        description: 'Agenda una sesión para discutir tus necesidades'
      }
    ]
  },
  'estandar-profesional': {
    id: 'estandar-profesional',
    title: 'Lleva tu estándar profesional al siguiente nivel',
    description: 'Guío la elaboración de rutas de aprendizaje para aumentar capacidades y avanzar hacia nuevos desafíos profesionales',
    youtubeUrl: 'https://youtu.be/iFzUNSmlGOI?si=zNPZU2jx37LhV8KD',
    resources: [
      {
        type: 'book',
        title: 'Libro Canvas del Éxito y la Prosperidad',
        link: 'https://go.hotmart.com/Q97401255X?dp=1',
        status: 'available',
        image: '/CanvasPortada.jpg'
      },
      {
        type: 'book',
        title: 'Libro: Buena Vibra Para Vivir Con Valentia',
        link: 'https://go.hotmart.com/D97400047L?dp=1',
        status: 'available',
        image: '/buenavibraPortada.png'
      },
      {
        type: 'book',
        title: 'Libro: Consolida y Dirigue Equipos Que Garanticen Resultados',
        link: 'https://go.hotmart.com/X97279249D?dp=1',
        status: 'available',
        image: '/consolidaequiposPortada.png'
      },
      {
        type: 'course',
        title: 'Curso: Transformación Personal',
        link: 'https://go.hotmart.com/W96797334T?dp=1',
        status: 'available',
        image: '/Curso_CanvasDelExito.png'
      },
      {
        type: 'course',
        title: 'Curso: Consolida y Dirigue Equipos Que Garanticen Resultados',
        link: 'https://go.hotmart.com/V97490299M?dp=1',
        status: 'available',
        image: '/Curso_ConsolidaYDirigeEquipos.jpeg'
      },
      {
        type: 'contact',
        title: 'Programa de Asesoría',
        description: 'Agenda una sesión de consultoría personalizada'
      }
    ]
  },
  'alianzas-gobernanzas': {
    id: 'alianzas-gobernanzas',
    title: 'Gestiona Alianzas y Gobernanzas',
    description: 'Asesoro el diseño y gestión de alianzas y gobernanzas para el desarrollo',
    youtubeUrl: 'https://youtu.be/mnjLI7XD4sw?si=_m6cP-8hHvReLShx',
    resources: [
      {
        type: 'book',
        title: 'Libro de Alianzas y Gobernanzas',
        status: 'coming-soon'
      },
      {
        type: 'program',
        title: 'Curso de Gestión de Alianzas',
        status: 'coming-soon',
        image: '/Curso_GestionAlianzas.jpeg'
      },
      {
        type: 'contact',
        title: 'Conferencias, Seminarios y Talleres',
        description: 'Agenda una sesión para discutir tus necesidades'
      }
    ]
  },
  'sostenibilidad-esal': {
    id: 'sostenibilidad-esal',
    title: 'Sostenibilidad de Organizaciones sin Ánimo de Lucro',
    description: 'Facilito la construcción de estrategias sólidas de sostenibilidad de organizaciones sin ánimo de lucro que trabajan por el desarrollo',
    youtubeUrl: 'https://youtu.be/5iLPjm4KVt8?si=mJ_Z-E5_SAwocMke',
    resources: [
      {
        type: 'program',
        title: 'Programa de Sostenibilidad para ESAL',
        link: '#',
        status: 'available'
      },
      {
        type: 'masterclass',
        title: 'Masterclass de Sostenibilidad',
        link: 'https://www.youtube.com/@FabioCanchila',
        status: 'available'
      },
      {
        type: 'contact',
        title: 'Conferencias, Seminarios y Talleres',
        description: 'Agenda una sesión para discutir tus necesidades'
      }
    ]
  }
};

export default function ValuePropositionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const proposition = VALUE_PROPOSITIONS[id || ''];

  if (!proposition) {
    navigate('/');
    return null;
  }

  // Función para extraer el ID del video de YouTube de cualquier formato de URL
  const getYoutubeVideoId = (url: string): string => {
    // Intentar extraer el ID de varios formatos de URL de YouTube
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return match[2];
    }
    
    // Si no se puede extraer, devolver la URL completa
    return url;
  };

  const handleContact = (type: 'email' | 'whatsapp', title: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (type === 'email') {
      const subject = encodeURIComponent(`Consulta: ${title}`);
      const body = encodeURIComponent(`Hola, me interesa saber más sobre ${title}.`);
      window.location.href = `mailto:fc@fabiocanchila.com?subject=${subject}&body=${body}`;
    } else {
      const message = encodeURIComponent(`Hola, me interesa saber más sobre ${title}.`);
      window.open(`https://wa.me/573103688201?text=${message}`, '_blank');
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const isComingSoon = resource.status === 'coming-soon';
    const isDraft = resource.status === 'draft';
  
    let Icon;
    switch (resource.type) {
      case 'book':
        Icon = Book;
        break;
      case 'whatsapp':
        Icon = MessageCircle;
        break;
      case 'contact':
        Icon = Calendar;
        break;
      case 'masterclass':
        Icon = Users;
        break;
      default:
        Icon = ExternalLink;
    }
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start space-x-4">
          {(resource.type === 'book' || resource.type === 'course') && resource.image ? (
            <div className="relative w-16 h-24 mx-auto group perspective">
              <div className="relative preserve-3d group-hover:rotate-y-6 transition-transform duration-500">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover rounded-lg shadow-xl transform-style-3d backface-hidden"
                  style={{
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.15)'
                  }}
                />
                {/* Efecto de lomo del libro */}
                <div 
                  className="absolute inset-y-0 -left-2 w-2 bg-gray-800 transform-style-3d origin-right skew-y-6"
                  style={{ transform: 'rotateY(-90deg)' }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-gray-600 mb-4">{resource.description}</p>
            )}
            {resource.type === 'contact' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleContact('email', resource.title)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contactar por Email
                </button>
                <button
                  onClick={() => handleContact('whatsapp', resource.title)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Atención personalizada por Chat de WhatsApp
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                {isComingSoon ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Próximamente
                  </span>
                ) : isDraft ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Borrador
                  </span>
                ) : (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-dark"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Acceder
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {proposition.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {proposition.description}
          </p>
        </motion.div>

        {proposition.youtubeUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="mb-8 relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(proposition.youtubeUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeVideoId(proposition.youtubeUrl)}&rel=0&modestbranding=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full absolute top-0 left-0 rounded-lg"
              />
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {proposition.resources.map((resource, index) => (
            <ResourceCard key={index} resource={resource} />
          ))}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}