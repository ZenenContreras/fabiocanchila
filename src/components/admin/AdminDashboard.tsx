import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import BlogManager from './BlogManager';
import ProductManager from './ProductManager';
import ServiceManager from './ServiceManager';
import AccessManager from './AccessManager';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-custom-gray-light pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Panel de Administración</h1>
        
        <Tabs.Root defaultValue="services">
          <Tabs.List className="bg-white shadow-sm rounded-lg p-1 mb-8 flex space-x-2">
            <Tabs.Trigger 
              value="services"
              className="px-6 py-3 text-sm font-medium rounded-md transition-colors data-[state=active]:text-primary data-[state=active]:bg-primary-light/10 text-custom-gray-dark hover:text-primary hover:bg-primary-light/5"
            >
              Servicios
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="products"
              className="px-6 py-3 text-sm font-medium rounded-md transition-colors data-[state=active]:text-primary data-[state=active]:bg-primary-light/10 text-custom-gray-dark hover:text-primary hover:bg-primary-light/5"
            >
              Publicaciones
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="blog"
              className="px-6 py-3 text-sm font-medium rounded-md transition-colors data-[state=active]:text-primary data-[state=active]:bg-primary-light/10 text-custom-gray-dark hover:text-primary hover:bg-primary-light/5"
            >
              Blog
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="access"
              className="px-6 py-3 text-sm font-medium rounded-md transition-colors data-[state=active]:text-primary data-[state=active]:bg-primary-light/10 text-custom-gray-dark hover:text-primary hover:bg-primary-light/5"
            >
              Gestión de Accesos
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="blog" className="bg-white rounded-lg shadow-lg p-6">
            <BlogManager />
          </Tabs.Content>

          <Tabs.Content value="products" className="bg-white rounded-lg shadow-lg p-6">
            <ProductManager />
          </Tabs.Content>

          <Tabs.Content value="services" className="bg-white rounded-lg shadow-lg p-6">
            <ServiceManager />
          </Tabs.Content>

          <Tabs.Content value="access" className="bg-white rounded-lg shadow-lg p-6">
            <AccessManager />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}