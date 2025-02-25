import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ExternalLink, Search, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Book {
  id: string;
  title: string;
  file_url?: string;
}

interface AccessRecord {
  id: string;
  email: string;
  book: {
    id: string;
    title: string;
  };
  created_at: string;
  expires_at: string;
  is_active: boolean;
  token: string;
}


export default function AccessManager() {
  const { session, user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [accesses, setAccesses] = useState<AccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Estado para el formulario de nuevo libro
  const [newBook, setNewBook] = useState({
    title: '',
    file: null as File | null,
  });
  
  // Estado para el formulario de nuevo acceso
  const [newAccess, setNewAccess] = useState({
    email: '',
    bookId: '',
    expiresAt: ''
  });

  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (session?.user.email === 'zenen1@gmail.com') {
      fetchBooks();
      fetchAccesses();
    }
  }, [session]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, file_url')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
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
    if (!newBook.title || !newBook.file || !user?.id) {
      setError('Por favor ingresa un título y selecciona un archivo PDF');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      console.log('Usuario actual:', {
        id: user.id,
        email: session?.user.email
      });

      // 1. Subir el archivo a Storage
      const fileExt = newBook.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Intentando subir archivo:', {
        bucket: 'secure-books',
        filePath,
        fileSize: newBook.file.size
      });

      const { error: uploadError } = await supabase.storage
        .from('secure-books')
        .upload(filePath, newBook.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      // 2. Obtener la URL del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('secure-books')
        .getPublicUrl(filePath);

      console.log('Archivo subido exitosamente:', {
        filePath,
        publicUrl
      });

      // 3. Crear el registro en la base de datos
      console.log('Intentando crear registro en la base de datos:', {
        title: newBook.title,
        file_url: filePath,
        created_by: user.id,
        pdf_url: publicUrl
      });

      const { data: insertData, error: dbError } = await supabase
        .from('books')
        .insert({
          title: newBook.title,
          file_url: filePath,
          created_by: user.id,
          pdf_url: publicUrl
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error al crear registro en la base de datos:', dbError);
        // Si hay error en la base de datos, intentamos eliminar el archivo subido
        await supabase.storage
          .from('secure-books')
          .remove([filePath]);
        throw new Error(`Error al crear registro: ${dbError.message}`);
      }

      console.log('Registro creado exitosamente:', insertData);

      // 4. Limpiar el formulario y actualizar la lista
      setNewBook({ title: '', file: null });
      if (document.getElementById('file-upload') instanceof HTMLInputElement) {
        (document.getElementById('file-upload') as HTMLInputElement).value = '';
      }
      await fetchBooks();

    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const fetchAccesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('secure_access_tokens')
        .select(`
          id,
          email,
          token,
          created_at,
          expires_at,
          is_active,
          book:book_id (
            id,
            title
          )
        `)
        .returns<AccessRecord[]>()
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccesses(data || []);
    } catch (err: any) {
      console.error('Error al cargar accesos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!newAccess.email || !newAccess.bookId || !newAccess.expiresAt) {
        throw new Error('Por favor completa todos los campos');
      }

      const { error } = await supabase
        .from('secure_access_tokens')
        .insert({
          email: newAccess.email.toLowerCase(),
          book_id: newAccess.bookId,
          expires_at: new Date(newAccess.expiresAt).toISOString(),
          is_active: true
        });

      if (error) throw error;

      await fetchAccesses();
      setNewAccess({ email: '', bookId: '', expiresAt: '' });

    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevokeAccess = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres revocar este acceso?')) return;

    try {
      const { error } = await supabase
        .from('secure_access_tokens')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      await fetchAccesses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredAccesses = accesses.filter(access => 
    access.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    access.book.title.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Formulario para subir nuevo libro */}
      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
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
                value={newBook.title}
                onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
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
          <button
            type="submit"
            disabled={uploading}
            className={`w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg transition-colors duration-200 ${
              uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
            }`}
          >
            <Upload className="h-5 w-5 mr-2" />
            {uploading ? 'Subiendo...' : 'Subir Libro'}
          </button>
        </form>
      </div>

      {/* Formulario para nuevo acceso */}
      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
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
                value={newAccess.bookId}
                onChange={(e) => setNewAccess(prev => ({ ...prev, bookId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Selecciona un libro</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title}
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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Acceso
          </button>
        </form>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Buscar por correo o título del libro..."
        />
      </div>

      {/* Lista de accesos */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libro
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expira
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccesses.map(access => (
                <tr key={access.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-gray-900">{access.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="text-gray-900">{access.book.title}</div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(access.created_at).toLocaleDateString()}
                  </td>
                  <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(access.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      access.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {access.is_active ? 'Activo' : 'Revocado'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
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
                      {access.is_active && (
                        <button
                          onClick={() => handleRevokeAccess(access.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Revocar acceso"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAccesses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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