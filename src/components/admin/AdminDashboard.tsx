import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import BlogManager from './BlogManager';
import ProductManager from './ProductManager';
import ServiceManager from './ServiceManager';
import AccessManager from './AccessManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="min-h-screen bg-custom-gray-light pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Panel de Administración</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-sm rounded-lg p-1 mb-8">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="products">Publicaciones</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="access">Gestión de Accesos</TabsTrigger>
          </TabsList>

          <TabsContent value="blog" className="bg-white rounded-lg shadow-lg p-6">
            <BlogManager />
          </TabsContent>

          <TabsContent value="products" className="bg-white rounded-lg shadow-lg p-6">
            <ProductManager />
          </TabsContent>

          <TabsContent value="services" className="bg-white rounded-lg shadow-lg p-6">
            <ServiceManager />
          </TabsContent>

          <TabsContent value="access" className="bg-white rounded-lg shadow-lg p-6">
            <AccessManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}