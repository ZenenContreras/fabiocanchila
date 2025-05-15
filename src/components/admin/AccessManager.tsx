import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ExternalLink, Search, Upload, AlertCircle, Book, Eye, EyeOff, Edit2, Clock, Mail, Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  is_active: boolean;
  libro: Libro;
}

interface NewAccess {
  email: string;
  libroId: string;
  expiresAt: string;
}

interface NewBook {
  titulo: string;
  file: File | null;
}

interface SupabaseResponse {
  id: string;
  email: string;
  token: string;
  created_at: string;
  is_active: boolean;
  libro: {
    id: string;
    titulo: string;
    archivo_url: string;
    created_at: string;
  };
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
  const [newBook, setNewBook] = useState<NewBook>({
    titulo: '',
    file: null,
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

  // Agregar este estado al inicio del componente junto a los otros estados
  const [copiedAccessId, setCopiedAccessId] = useState<string | null>(null);

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

      if (!newAccess.email || !newAccess.libroId) {
        throw new Error('Por favor completa todos los campos');
      }

      // Primero verificamos que el libro existe
      const { data: libroExiste, error: libroError } = await supabase
        .from('libro_pdf')
        .select('id')
        .eq('id', newAccess.libroId)
        .single();

      if (libroError || !libroExiste) {
        throw new Error('El libro seleccionado no está disponible');
      }

      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Creamos el nuevo acceso
      const { data: newAccessData, error } = await supabase
        .from('acceso_pdf')
        .insert({
          email: newAccess.email.toLowerCase(),
          libro_id: newAccess.libroId,
          token: token,
          is_active: true,
          created_at: new Date().toISOString(),
          expires_at: null // Sin fecha de expiración
        })
        .select(`
          id,
          email,
          token,
          created_at,
          is_active,
          libro:libro_pdf (
            id,
            titulo,
            archivo_url,
            created_at
          )
        `)
        .single();

      if (error) {
        console.error('Error al crear acceso:', error);
        throw error;
      }

      if (!newAccessData || !newAccessData.libro) {
        throw new Error('Error al crear el acceso');
      }

      const formattedAccess = {
        id: newAccessData.id,
        email: newAccessData.email,
        token: newAccessData.token,
        created_at: newAccessData.created_at,
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
    setExpiresAt(access.created_at.split('T')[0]);
  };

  const handleUpdate = async () => {
    if (!editingAccess) return;

    try {
      const { error } = await supabase
        .from('acceso_pdf')
        .update({
          email,
          created_at: new Date(expiresAt).toISOString(),
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
    <div className="space-y-6">
      {/* Header y Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Accesos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra los accesos a los libros digitales
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
          >
            <Upload className="h-5 w-5 mr-2" />
            Subir Libro
          </button>
          
          <button
            onClick={() => setShowAccessForm(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Acceso
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por email o título del libro..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Grid de Libros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {libros.map((libro) => (
          <div key={libro.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {editingBook?.id === libro.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingBookTitle}
                        onChange={(e) => setEditingBookTitle(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        onClick={handleUpdateBook}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBook(null);
                          setEditingBookTitle('');
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {libro.titulo}
                    </h3>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {accesses.filter(a => a.libro.id === libro.id).length} accesos activos
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditBook(libro)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(libro.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de Accesos */}
      <div className="mt-8 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Libro</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Fecha</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAccesses.map((access) => (
                  <tr key={access.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{access.email}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm hidden sm:table-cell">
                      <div className="flex items-center">
                        <Book className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{access.libro.titulo}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <button
                        onClick={() => toggleActive(access.id, access.is_active)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
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
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {format(new Date(access.created_at), 'PPP', { locale: es })}
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              const baseUrl = window.location.origin;
                              const url = `${baseUrl}/libro-seguro/${access.token}`;
                              await navigator.clipboard.writeText(url);
                              setCopiedAccessId(access.id);
                              setTimeout(() => setCopiedAccessId(null), 2000);
                            } catch (err) {
                              console.error('Error al copiar:', err);
                            }
                          }}
                          className="relative group"
                          title="Copiar enlace"
                        >
                          {copiedAccessId === access.id ? (
                            <div className="absolute -top-8 -left-8 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              ¡Copiado!
                            </div>
                          ) : (
                            <div className="absolute -top-8 -left-8 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                              Copiar link
                            </div>
                          )}
                          <ExternalLink className={`h-4 w-4 ${copiedAccessId === access.id ? 'text-green-500' : 'text-primary hover:text-primary-dark'}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(access.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar acceso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay accesos */}
      {filteredAccesses.length === 0 && (
        <div className="text-center py-12">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay accesos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando un nuevo acceso para tus libros digitales.
          </p>
        </div>
      )}

      {/* Modales */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Subir Nuevo Libro
            </h3>
            <form onSubmit={handleUploadBook} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título del Libro
                </label>
                <input
                  type="text"
                  id="title"
                  value={newBook.titulo}
                  onChange={(e) => setNewBook({ ...newBook, titulo: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Archivo PDF
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Seleccionar archivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                    </div>
                    {newBook.file && (
                      <p className="text-sm text-gray-500">
                        {newBook.file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setNewBook({ titulo: '', file: null });
                  }}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Subir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAccessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Crear Nuevo Acceso
            </h3>
            <form onSubmit={handleCreateAccess} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={newAccess.email}
                  onChange={(e) => setNewAccess({ ...newAccess, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="libro" className="block text-sm font-medium text-gray-700">
                  Libro
                </label>
                <select
                  id="libro"
                  value={newAccess.libroId}
                  onChange={(e) => setNewAccess({ ...newAccess, libroId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                >
                  <option value="">Seleccionar libro</option>
                  {libros.map((libro) => (
                    <option key={libro.id} value={libro.id}>
                      {libro.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccessForm(false);
                    setNewAccess({ email: '', libroId: '', expiresAt: '' });
                  }}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 