import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLoggedIn: boolean;
}

export default function Header({ onLoginClick, onLogoutClick, isLoggedIn }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { title: 'Inicio', path: '/' },
    { title: 'Servicios', path: '/services' },
    { title: 'Publicaciones', path: '/products' },
    { title: 'Blog', path: '/blog' },
    { title: 'Sobre Mí', path: '/about' },
  ];

  if (isLoggedIn && isAdmin) {
    menuItems.push({ title: 'Admin', path: '/admin' });
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary/95 backdrop-blur-md shadow-lg' : 'bg-primary/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-32 w-32 transition-transform duration-300 group-hover:scale-105"
              style={{ strokeWidth: '2.5' }}
            />
            <span className="font-display text-2xl sm:text-3xl font-bold text-custom-white tracking-tight group-hover:text-accent transition-colors">
              Fabio Canchila
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-display text-xl text-custom-white hover:text-accent transition-colors relative py-2 ${
                  isActive(item.path) ? 'font-semibold' : ''
                }`}
              >
                {item.title}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}

            {/* Login/Logout button with reduced prominence */}
            <button
              onClick={isLoggedIn ? onLogoutClick : onLoginClick}
              className="text-custom-white/80 hover:text-accent transition-colors"
            >
              {isLoggedIn ? <LogOut size={20} /> : <LogIn size={20} />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-custom-white hover:text-accent transition-colors p-2"
            onClick={(scrollToTop) => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-primary border-t border-primary-light/10"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`block px-4 py-3 text-custom-white hover:bg-primary-dark rounded-md transition-all duration-300 font-display text-lg ${
                      isActive(item.path) ? 'bg-primary-dark font-semibold' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.title}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: menuItems.length * 0.05 }}
              >
                <button
                  onClick={() => {
                    isLoggedIn ? onLogoutClick() : onLoginClick();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 mt-4 text-left text-custom-white/80 hover:text-accent transition-colors flex items-center font-display text-lg"
                >
                  {isLoggedIn ? (
                    <>
                      <LogOut size={20} className="mr-2" />
                      Cerrar Sesión
                    </>
                  ) : (
                    <>
                      <LogIn size={20} className="mr-2" />
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}