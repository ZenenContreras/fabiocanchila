import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, BookOpen, Mail } from 'lucide-react';

interface LibroData {
  titulo: string;
  archivo_url: string;
  email: string;
}

interface SupabaseLibro {
  titulo: string;
  archivo_url: string;
}

interface SupabaseAccess {
  email: string;
  libro: SupabaseLibro;
  expires_at: string | null;
  is_active: boolean;
}

interface SupabaseResponse {
  email: string;
  expires_at: string | null;
  is_active: boolean;
  libro: {
    titulo: string;
    archivo_url: string;
  };
}

export default function SecureBookViewer() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [libroData, setLibroData] = useState<LibroData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      setPdfError(null);

      if (!token) {
        throw new Error('Token no proporcionado');
      }

      console.log('Validando token:', token);

      const { data: accessData, error: accessError } = await supabase
        .from('acceso_pdf')
        .select(`
          email,
          is_active,
          expires_at,
          libro:libro_pdf!acceso_pdf_libro_id_fkey (
            titulo,
            archivo_url
          )
        `)
        .eq('token', token)
        .single();

      console.log('Respuesta de Supabase:', { accessData, accessError });

      if (accessError) {
        console.error('Error validando token:', accessError);
        throw new Error('Token de acceso inválido');
      }
      
      if (!accessData) {
        throw new Error('Acceso no encontrado');
      }

      if (!accessData.is_active) {
        throw new Error('Este acceso ha sido desactivado');
      }

      if (accessData.expires_at && new Date(accessData.expires_at) < new Date()) {
        await supabase
          .from('acceso_pdf')
          .update({ is_active: false })
          .eq('token', token);
        
        throw new Error('Este acceso ha expirado');
      }

      if (!accessData.libro) {
        throw new Error('El libro asociado no está disponible');
      }

      const response = accessData as unknown as SupabaseResponse;
      const access: SupabaseAccess = {
        email: response.email,
        expires_at: response.expires_at,
        is_active: response.is_active,
        libro: {
          titulo: response.libro.titulo,
          archivo_url: response.libro.archivo_url
        }
      };

      // Verificar que el archivo existe en el storage de manera más directa
      const { data: signedUrl, error: signError } = await supabase
        .storage
        .from('secure-books')
        .createSignedUrl(access.libro.archivo_url, 60); // URL válida por 60 segundos

      if (signError) {
        console.error('Error obteniendo URL firmada:', signError);
        throw new Error('El archivo no está disponible en este momento');
      }

      setLibroData({
        titulo: access.libro.titulo,
        archivo_url: access.libro.archivo_url,
        email: access.email
      });

    } catch (err: any) {
      console.error('Error en validateToken:', err);
      setError(err.message || 'Error al validar el acceso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, [token]);

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!libroData) return;

    if (email.toLowerCase() === libroData.email.toLowerCase()) {
      setIsAuthenticated(true);
    } else {
      setAuthError('El correo electrónico no coincide con el acceso autorizado');
    }
  };

  const handlePdfError = () => {
    setPdfError('Error al cargar el PDF. Por favor, intente de nuevo más tarde.');
    console.error('Error al cargar el PDF:', {
      url: libroData?.archivo_url,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL
    });
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

  const pdfUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/secure-books/${libroData.archivo_url}`;

  // Función para generar el viewer URL de Google
  const getGoogleViewerUrl = (pdfUrl: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true&chrome=false`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 break-words">
                  {libroData.titulo}
                </h1>
                <p className="text-sm text-gray-500 break-words">
                  Acceso exclusivo para {libroData.email}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Lock className="h-4 w-4 mr-1 flex-shrink-0" />
              Visualización Segura
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-[calc(100vh-110px)] px-4 sm:px-6 lg:px-8 py-4">
        <div 
          className="relative w-full h-full rounded-lg overflow-hidden shadow-lg" 
          onContextMenu={(e) => e.preventDefault()}
        >
          {pdfError ? (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{pdfError}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Si el problema persiste, por favor contacta a soporte.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <iframe
                src={getGoogleViewerUrl(pdfUrl)}
                className="w-full h-full"
                style={{
                  border: 'none',
                }}
                title={libroData.titulo}
                onError={handlePdfError}
              />
            </div>
          )}
          <div 
            className="absolute inset-0 pointer-events-none select-none" 
            style={{ 
              background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill-opacity="0.05"><text x="50%" y="50%" font-size="12" fill="%23000" text-anchor="middle" alignment-baseline="middle">${libroData.email}</text></svg>')`,
              mixBlendMode: 'multiply',
              opacity: 0.5,
              pointerEvents: 'none'
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-100 py-2 px-4 text-center text-sm text-gray-600">
            <p className="break-words">Este contenido está protegido y es solo para visualización</p>
            <p className="text-xs mt-1 break-words">Acceso exclusivo para: {libroData.email}</p>
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            * {
              display: none !important;
            }
          }

          /* Ocultar botón de ventana externa */
          .ndfHFb-c4YZDc-Wrql6b {
            display: none !important;
            position: fixed !important;
            top: -9999px !important;
            left: -9999px !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
          }
          
          /* Ocultar botón de ventana externa (selector alternativo) */
          .ndfHFb-c4YZDc-to915-LgbsSe {
            display: none !important;
            position: fixed !important;
            top: -9999px !important;
            left: -9999px !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
          }

          /* Ocultar cualquier botón de acción en el visor */
          [role="button"] {
            display: none !important;
            position: fixed !important;
            top: -9999px !important;
            left: -9999px !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
          }

          @media (max-width: 640px) {
            .min-h-screen {
              padding-top: 1rem;
            }
          }
        `}
      </style>
    </div>
  );
} 