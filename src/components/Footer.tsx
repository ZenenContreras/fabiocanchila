import { Link } from 'react-router-dom';
import { Youtube, Linkedin, Twitter, Mail, Phone, MapPin, BookOpen, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-custom-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="Logo" className="h-14 w-14 mr-1" />
              <h3 className="text-2xl font-bold">Fabio Canchila</h3>
            </div>
            <p className="text-custom-white/80 mb-6 text-base sm:text-lg leading-relaxed">
Trabajo con personas, empresas, instituciones y organizaciones para aumentar sus capacidades y aportar valor en la gestión del desarrollo económico, del desarrollo humano integral, el cuidado de la naturaleza y la construcción de Paz.
            </p>
            <div className="flex space-x-6">
              <a 
                href="https://www.youtube.com/@fabiocanchila" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-custom-white/60 hover:text-accent transition-colors transform hover:scale-110"
              >
                <Youtube size={24} />
              </a>
              <a 
                href="https://linkedin.com/in/fabiocanchila" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-custom-white/60 hover:text-accent transition-colors transform hover:scale-110"
              >
                <Linkedin size={24} />
              </a>
              <a 
                href="https://twitter.com/fabiocanchila" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-custom-white/60 hover:text-accent transition-colors transform hover:scale-110"
              >
                <Twitter size={24} />
              </a>
              <a 
                href="https://www.instagram.com/fabio_canchila/"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-custom-white/60 hover:text-accent transition-colors transform hover:scale-110"
              >
                <Instagram size={24} />
              </a>
              <Link 
                to="/publicaciones" 
                className="text-custom-white/60 hover:text-accent transition-colors transform hover:scale-110"
              >
                <BookOpen size={24} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-4">
              {[
                { to: "/", text: "Inicio" },
                { to: "/products", text: "Publicaciones" },
                { to: "/services", text: "Servicios" },
                { to: "/blog", text: "Blog" },
                { to:"/About " , text: "Sobre Mi"}
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-custom-white/60 hover:text-accent transition-colors block transform hover:translate-x-2"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:contacto@fabiocanchila.com" 
                  className="flex items-center text-custom-white/60 hover:text-accent transition-colors group"
                >
                  <Mail size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <span>fc@fabiocanchila.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+573001234567" 
                  className="flex items-center text-custom-white/60 hover:text-accent transition-colors group"
                >
                  <Phone size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <span>+57 3103688201</span>
                </a>
              </li>
              <li className="flex items-center text-custom-white/60 group">
                <MapPin size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                <span>Colombia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-custom-white/10 mt-12 pt-8 text-center text-custom-white/60">
          <p className="text-sm sm:text-base">
            &copy; {currentYear} Fabio Canchila. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}