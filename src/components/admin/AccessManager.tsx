import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ExternalLink, Search, Upload, AlertCircle, Book, Eye, EyeOff, Edit2, Clock, Mail, Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LibroPdf {
  id: string;
  titulo: string;
  archivo_url: string;
  created_at: string;
}

interface Access {
  id: string;
  email: string;
  token: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  libro: {
    titulo: string;
    id: string;
  };
}

export default function AccessManager() {
  const { session, user } = useAuth();
  const [libros, setLibros] = useState<LibroPdf[]>([]);
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAccessForm, setShowAccessForm] = useState(false);
  
  // Estado para el formulario de nuevo libro
  const [newBook, setNewBook] = useState({
    titulo: '',
    file: null as File | null,
  });
  
  // Estado para el formulario de nuevo acceso
  const [newAccess, setNewAccess] = useState({
    email: '',
    libroId: '',
    expiresAt: ''
  });

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para editar acceso
  const [editingAccess, setEditingAccess] = useState<Access | null>(null);
  const [email, setEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Estado para editar libro
  const [editingBook, setEditingBook] = useState<LibroPdf | null>(null);
  const [editingBookTitle, setEditingBookTitle] = useState('');

  useEffect(() => {
    if (session?.user.email === 'zenen1@gmail.com') {
      fetchLibros();
      loadAccesses();
    }
  }, [session]);

  const fetchLibros = async () => {
    try {
      const { data, error } = await supabase
        .from('libro_pdf')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLibros(data || []);
    } catch (err: any) {
      console.error('Error al cargar libros:', err);
      setError(err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }
      setNewBook(prev => ({ ...prev, file: file }));
    }
  };

  const handleUploadBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.titulo || !newBook.file || !user?.id) {
      setError('Por favor ingresa un título y selecciona un archivo PDF');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1. Subir el archivo a Storage
      const fileExt = newBook.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('secure-books')
        .upload(filePath, newBook.file);

      if (uploadError) {
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      // 2. Crear el registro en la base de datos
      const { error: dbError } = await supabase
        .from('libro_pdf')
        .insert({
          titulo: newBook.titulo,
          archivo_url: filePath,
          created_by: user.id
        });

      if (dbError) {
        // Si hay error en la base de datos, intentamos eliminar el archivo subido
        await supabase.storage
          .from('secure-books')
          .remove([filePath]);
        throw new Error(`Error al crear registro: ${dbError.message}`);
      }

      // 3. Limpiar el formulario y actualizar la lista
      setNewBook({ titulo: '', file: null });
      if (document.getElementById('file-upload') instanceof HTMLInputElement) {
        (document.getElementById('file-upload') as HTMLInputElement).value = '';
      }
      setShowUploadForm(false);
      await fetchLibros();

    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const loadAccesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('acceso_pdf')
        .select(`
          *,
          libro:libro_id (
            titulo,
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccesses(data || []);
    } catch (error) {
      console.error('Error cargando accesos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!newAccess.email || !newAccess.libroId || !newAccess.expiresAt) {
        throw new Error('Por favor completa todos los campos');
      }

      const { error } = await supabase
        .from('acceso_pdf')
        .insert({
          email: newAccess.email.toLowerCase(),
          libro_id: newAccess.libroId,
          expires_at: new Date(newAccess.expiresAt).toISOString(),
          is_active: true
        });

      if (error) throw error;

      await loadAccesses();
      setNewAccess({ email: '', libroId: '', expiresAt: '' });
      setShowAccessForm(false);

    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este acceso?')) return;

    try {
      const { error } = await supabase
        .from('acceso_pdf')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAccesses();
    } catch (error) {
      console.error('Error eliminando acceso:', error);
    }
  };

  const handleEdit = async (access: Access) => {
    setEditingAccess(access);
    setEmail(access.email);
    setExpiresAt(access.expires_at.split('T')[0]);
  };

  const handleUpdate = async () => {
    if (!editingAccess) return;

    try {
      const { error } = await supabase
        .from('acceso_pdf')
        .update({
          email,
          expires_at: new Date(expiresAt).toISOString(),
        })
        .eq('id', editingAccess.id);

      if (error) throw error;
      setEditingAccess(null);
      await loadAccesses();
    } catch (error) {
      console.error('Error actualizando acceso:', error);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('acceso_pdf')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      await loadAccesses();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleEditBook = (libro: LibroPdf) => {
    setEditingBook(libro);
    setEditingBookTitle(libro.titulo);
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('libro_pdf')
        .update({ titulo: editingBookTitle })
        .eq('id', editingBook.id);

      if (error) throw error;
      
      await fetchLibros();
      setEditingBook(null);
      setEditingBookTitle('');
    } catch (err: any) {
      console.error('Error actualizando libro:', err);
      setError(err.message);
    }
  };

  const filteredAccesses = accesses.filter(access => 
    access.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    access.libro.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (session?.user.email !== 'zenen1@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600 text-center">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Botones de acción principales */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Upload className="h-5 w-5 mr-2" />
          {showUploadForm ? 'Cancelar' : 'Subir Nuevo Libro'}
        </button>
        <button
          onClick={() => setShowAccessForm(!showAccessForm)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          {showAccessForm ? 'Cancelar' : 'Crear Nuevo Acceso'}
        </button>
      </div>

      {/* Formulario para subir nuevo libro */}
      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Subir Nuevo Libro
          </h3>
          <form onSubmit={handleUploadBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Libro
                </label>
                <input
                  type="text"
                  value={newBook.titulo}
                  onChange={(e) => setNewBook(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ingresa el título del libro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo PDF
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className={`inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
                }`}
              >
                <Upload className="h-5 w-5 mr-2" />
                {uploading ? 'Subiendo...' : 'Subir Libro'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Formulario para nuevo acceso */}
      {showAccessForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Crear Nuevo Acceso
          </h3>
          <form onSubmit={handleCreateAccess} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newAccess.email}
                  onChange={(e) => setNewAccess(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Libro
                </label>
                <select
                  value={newAccess.libroId}
                  onChange={(e) => setNewAccess(prev => ({ ...prev, libroId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Selecciona un libro</option>
                  {libros.map(libro => (
                    <option key={libro.id} value={libro.id}>
                      {libro.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Expiración
                </label>
                <input
                  type="date"
                  value={newAccess.expiresAt}
                  onChange={(e) => setNewAccess(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Acceso
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Grid de Libros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libros.map((libro, index) => (
          <motion.div
            key={libro.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-light rounded-lg mb-4 mx-auto">
                <Book className="h-8 w-8 text-primary" />
              </div>
              
              {editingBook?.id === libro.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingBookTitle}
                    onChange={(e) => setEditingBookTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Título del libro"
                  />
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={handleUpdateBook}
                      className="inline-flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingBook(null);
                        setEditingBookTitle('');
                      }}
                      className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    {libro.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Subido el {new Date(libro.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEditBook(libro)}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => setShowAccessForm(true)}
                      className="inline-flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Dar Acceso
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lista de Accesos */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Accesos Activos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Buscar por correo o título..."
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expira
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccesses.map((access) => (
                <tr key={access.id} className="hover:bg-gray-50">
                  {editingAccess?.id === access.id ? (
                    <>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha de Expiración
                            </label>
                            <input
                              type="date"
                              value={expiresAt}
                              onChange={(e) => setExpiresAt(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={handleUpdate}
                          className="text-primary hover:text-primary-dark mr-3"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingAccess(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Book className="w-5 h-5 text-primary mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {access.libro.titulo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{access.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(access.id, access.is_active)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            access.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {access.is_active ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {format(new Date(access.expires_at), "d 'de' MMMM, yyyy", {
                              locale: es,
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <a
                            href={`/libro-seguro/${access.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark"
                            title="Ver libro"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => handleEdit(access)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Editar acceso"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(access.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar acceso"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredAccesses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron registros de acceso
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 