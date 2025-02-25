import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, BookOpen, Mail } from 'lucide-react';

interface SecureBookData {
  title: string;
  pdfUrl: string;
  buyerEmail: string;
}

export default function SecureBookViewer() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookData, setBookData] = useState<SecureBookData | null>(null);
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
        .from('secure_access_tokens')
        .select('*, books(*)')
        .eq('token', token)
        .single();

      if (accessError) throw new Error('Token de acceso inválido');
      if (!accessData) throw new Error('Acceso no encontrado');
      if (new Date(accessData.expires_at) < new Date()) {
        throw new Error('El link de acceso ha expirado');
      }
      if (!accessData.is_active) {
        throw new Error('Este link de acceso ya no está activo');
      }

      setBookData({
        title: accessData.books.title,
        pdfUrl: accessData.books.pdf_url,
        buyerEmail: accessData.email
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!bookData) return;

    if (email.toLowerCase() === bookData.buyerEmail.toLowerCase()) {
      setIsAuthenticated(true);
      
      // Registrar acceso
      await supabase
        .from('access_logs')
        .insert({
          token,
          email,
          accessed_at: new Date().toISOString()
        });
    } else {
      setAuthError('Correo electrónico incorrecto');
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

  if (!bookData) return null;

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
              Ingresa tu correo electrónico para acceder al contenido
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
              Acceder al Contenido
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {bookData.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Acceso exclusivo para {bookData.buyerEmail}
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
            <iframe
              src={`${bookData.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
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