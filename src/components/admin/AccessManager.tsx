import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ExternalLink, Search, Upload, AlertCircle, Book, Eye, EyeOff, Edit2, Clock, Mail, Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Libro {
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
  libro: Libro;
}

interface NewAccess {
  email: string;
  libroId: string;
  expiresAt: string;
}

interface SupabaseAccess {
  id: string;
  email: string;
  token: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  libro: Libro;
}

export default function AccessManager() {
  const { session, user } = useAuth();
  const [libros, setLibros] = useState<Libro[]>([]);
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
  const [newAccess, setNewAccess] = useState<NewAccess>({
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
  const [editingBook, setEditingBook] = useState<Libro | null>(null);
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
      setError(null);

      const { data, error } = await supabase
        .from('acceso_pdf')
        .select(`
          id,
          email,
          token,
          created_at,
          expires_at,
          is_active,
          libro:libro_pdf!acceso_pdf_libro_id_fkey (
            id,
            titulo,
            archivo_url,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando accesos:', error);
        throw error;
      }

      if (!data) {
        setAccesses([]);
        return;
      }

      const formattedAccesses: Access[] = data.map((access: any) => ({
        id: access.id,
        email: access.email,
        token: access.token,
        created_at: access.created_at,
        expires_at: access.expires_at,
        is_active: access.is_active,
        libro: {
          id: access.libro.id,
          titulo: access.libro.titulo,
          archivo_url: access.libro.archivo_url,
          created_at: access.libro.created_at
        }
      }));

      setAccesses(formattedAccesses);
    } catch (err) {
      console.error('Error cargando accesos:', err);
      setError('Error al cargar los accesos');
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

      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { data: newAccessData, error } = await supabase
        .from('acceso_pdf')
        .insert({
          email: newAccess.email.toLowerCase(),
          libro_id: newAccess.libroId,
          token: token,
          expires_at: new Date(newAccess.expiresAt).toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select(`
          id,
          email,
          token,
          created_at,
          expires_at,
          is_active,
          libro:libro_pdf!acceso_pdf_libro_id_fkey (
            id,
            titulo,
            archivo_url,
            created_at
          )
        `)
        .single();

      if (error) throw error;

      if (newAccessData) {
        const formattedAccess: Access = {
          id: newAccessData.id,
          email: newAccessData.email,
          token: newAccessData.token,
          created_at: newAccessData.created_at,
          expires_at: newAccessData.expires_at,
          is_active: newAccessData.is_active,
          libro: {
            id: newAccessData.libro.id,
            titulo: newAccessData.libro.titulo,
            archivo_url: newAccessData.libro.archivo_url,
            created_at: newAccessData.libro.created_at
          }
        };

        setAccesses(prev => [formattedAccess, ...prev]);
        setNewAccess({ email: '', libroId: '', expiresAt: '' });
        setShowAccessForm(false);
      }
    } catch (err: any) {
      console.error('Error creando acceso:', err);
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

  const handleEditBook = (libro: Libro) => {
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

  const handleDeleteBook = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este libro? Se eliminarán también todos los accesos asociados.')) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('libro_pdf')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLibros();
      await loadAccesses();
    } catch (err: any) {
      console.error('Error eliminando libro:', err);
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
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Accesos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administra los accesos a los libros digitales
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <Upload className="h-5 w-5 mr-2" />
              Subir Libro
            </button>
            <button
              onClick={() => setShowAccessForm(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Acceso
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por email o título del libro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid de Libros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {libros.map((libro, index) => (
            <motion.div
              key={libro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-4 border border-gray-200 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-light rounded-lg">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditBook(libro)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar libro"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(libro.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar libro"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
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
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleUpdateBook}
                      className="inline-flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingBook(null);
                        setEditingBookTitle('');
                      }}
                      className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors text-sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-grow">
                    {libro.titulo}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Subido el {format(new Date(libro.created_at), 'PPP', { locale: es })}</p>
                    <p>{accesses.filter(a => a.libro.id === libro.id).length} accesos activos</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewAccess(prev => ({ ...prev, libroId: libro.id }));
                      setShowAccessForm(true);
                    }}
                    className="w-full inline-flex items-center justify-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Dar Acceso
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tabla de Accesos */}
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Libro</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expira</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAccesses.map((access) => (
                    <tr key={access.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900 line-clamp-1">{access.libro.titulo}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {editingAccess?.id === access.id ? (
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <span className="line-clamp-1">{access.email}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => toggleActive(access.id, access.is_active)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            access.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {access.is_active ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {editingAccess?.id === access.id ? (
                          <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {format(new Date(access.expires_at), 'PPP', { locale: es })}
                          </div>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/libro-seguro/${access.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-primary hover:text-primary-dark rounded-full hover:bg-gray-100 transition-colors"
                            title="Ver libro"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                          {editingAccess?.id === access.id ? (
                            <>
                              <button
                                onClick={handleUpdate}
                                className="p-1 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50 transition-colors"
                                title="Guardar cambios"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setEditingAccess(null)}
                                className="p-1 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                                title="Cancelar"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(access)}
                                className="p-1 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
                                title="Editar acceso"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(access.id)}
                                className="p-1 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                title="Eliminar acceso"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Subir Libro */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowUploadForm(false)} />

            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Subir Nuevo Libro
                  </h3>

                  <form onSubmit={handleUploadBook} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                        Título del Libro
                      </label>
                      <input
                        type="text"
                        id="titulo"
                        value={newBook.titulo}
                        onChange={(e) => setNewBook({ ...newBook, titulo: e.target.value })}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                        Archivo PDF
                      </label>
                      <input
                        type="file"
                        id="file-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="block w-full mt-1 text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary-dark
                          file:cursor-pointer cursor-pointer"
                        required
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={uploading}
                        className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm ${
                          uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-2" />
                            Subir Libro
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        disabled={uploading}
                        className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Acceso */}
      {showAccessForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowAccessForm(false)} />

            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowAccessForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Crear Nuevo Acceso
                  </h3>

                  <form onSubmit={handleCreateAccess} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="libro" className="block text-sm font-medium text-gray-700">
                        Libro
                      </label>
                      <select
                        id="libro"
                        value={newAccess.libroId}
                        onChange={(e) => setNewAccess({ ...newAccess, libroId: e.target.value })}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        required
                      >
                        <option value="">Selecciona un libro</option>
                        {libros.map((libro) => (
                          <option key={libro.id} value={libro.id}>
                            {libro.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={newAccess.email}
                          onChange={(e) => setNewAccess({ ...newAccess, email: e.target.value })}
                          className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="usuario@ejemplo.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="expires" className="block text-sm font-medium text-gray-700">
                        Fecha de Expiración
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="expires"
                          value={newAccess.expiresAt}
                          onChange={(e) => setNewAccess({ ...newAccess, expiresAt: e.target.value })}
                          className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Crear Acceso
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAccessForm(false)}
                        className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 