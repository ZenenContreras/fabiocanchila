import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, BookOpen, Mail } from 'lucide-react';

interface LibroData {
  titulo: string;
  archivo_url: string;
  email: string;
}

export default function SecureBookViewer() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [libroData, setLibroData] = useState<LibroData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: accessData, error: accessError } = await supabase
        .from('acceso_pdf')
        .select(`
          email,
          libro:libro_id (
            titulo,
            archivo_url
          )
        `)
        .eq('token', token)
        .single();

      if (accessError) throw new Error('Token de acceso inválido');
      if (!accessData) throw new Error('Acceso no encontrado');
      
      // Verificar si el acceso está activo y no ha expirado
      const { data: activeAccess, error: activeError } = await supabase
        .from('acceso_pdf')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (activeError || !activeAccess) {
        throw new Error('Este link de acceso ha expirado o no está activo');
      }

      setLibroData({
        titulo: accessData.libro.titulo,
        archivo_url: accessData.libro.archivo_url,
        email: accessData.email
      });

    } catch (err: any) {
      console.error('Error validando token:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!libroData) return;

    if (email.toLowerCase() === libroData.email.toLowerCase()) {
      setIsAuthenticated(true);
      
      // Registrar el acceso exitoso
      try {
        await supabase
          .from('acceso_pdf_logs')
          .insert({
            acceso_token: token,
            email: email,
            accessed_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error registrando acceso:', error);
      }
    } else {
      setAuthError('El correo electrónico no coincide con el acceso autorizado');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            Error de Acceso
          </h2>
          <p className="text-center text-gray-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!libroData) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso Protegido
            </h2>
            <p className="text-gray-600">
              Por favor, verifica tu identidad para acceder al contenido
            </p>
          </div>

          <form onSubmit={handleAuthentication} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Verificar Acceso
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Obtener la URL firmada para el archivo PDF
  const getSignedUrl = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('secure-books')
        .createSignedUrl(libroData.archivo_url, 3600); // URL válida por 1 hora

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error obteniendo URL firmada:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {libroData.titulo}
                </h1>
                <p className="text-sm text-gray-500">
                  Acceso exclusivo para {libroData.email}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Lock className="h-4 w-4 mr-1" />
              Visualización Segura
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Usamos un iframe con la URL firmada */}
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(libroData.archivo_url)}&embedded=true`}
              className="w-full h-full"
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            />
            <div 
              className="absolute inset-0" 
              style={{ 
                background: 'transparent',
                pointerEvents: 'none'
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Este contenido está protegido y es solo para visualización.</p>
          <p>No se permite la descarga o copia del material.</p>
        </div>
      </div>
    </div>
  );
} 