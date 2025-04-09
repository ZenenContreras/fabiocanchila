import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Menu, X } from 'lucide-react';
import BlogManager from './BlogManager';
import ProductManager from './ProductManager';
import ServiceManager from './ServiceManager';
import AccessManager from './AccessManager';
import UserManager from './UserManager';

export default function AdminDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { value: 'services', label: 'Servicios' },
    { value: 'products', label: 'Publicaciones' },
    { value: 'blog', label: 'Blog' },
    { value: 'users', label: 'Usuarios' },
    { value: 'access', label: 'Gestión de Accesos' }
  ];

  return (
    <div className="min-h-screen bg-custom-gray-light pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-primary">Panel de Administración</h1>
          
          {/* Botón de menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <span className="sr-only">Abrir menú</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>
        </div>
        
        <Tabs.Root defaultValue="services">
          <Tabs.List className={`bg-white shadow-sm rounded-lg mb-8 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'flex flex-col p-2 space-y-2' : 'hidden sm:flex sm:flex-row sm:p-1 sm:space-x-2'
          } sm:flex`}>
            {tabs.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors data-[state=active]:text-primary data-[state=active]:bg-primary-light/10 text-custom-gray-dark hover:text-primary hover:bg-primary-light/5 w-full sm:w-auto text-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="blog">
            <BlogManager />
          </Tabs.Content>

          <Tabs.Content value="products">
            <ProductManager />
          </Tabs.Content>

          <Tabs.Content value="services">
            <ServiceManager />
          </Tabs.Content>

          <Tabs.Content value="users">
            <UserManager />
          </Tabs.Content>

          <Tabs.Content value="access">
            <AccessManager />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}