import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, BookOpen, Mail } from 'lucide-react';

interface LibroData {
  titulo: string;
  archivo_url: string;
  email: string;
}

interface AccesoData {
  email: string;
  is_active: boolean;
  expires_at: string | null;
  libro_id: string;
}

interface LibroPdfData {
  titulo: string;
  archivo_url: string;
}

export default function SecureBookViewer() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [libroData, setLibroData] = useState<LibroData | null>(null);
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      setPdfError(null);

      if (!token) {
        throw new Error('Token no proporcionado');
      }

      // Usamos el cliente anónimo para la consulta
      const { data: accessData, error: accessError } = await supabase
        .from('acceso_pdf')
        .select('email, is_active, expires_at, libro_id')
        .eq('token', token)
        .single();

      console.log('Datos de acceso:', accessData);

      if (accessError) {
        console.error('Error en la consulta de acceso:', accessError);
        if (accessError.code === 'PGRST301') {
          throw new Error('Token de acceso inválido');
        }
        throw new Error('Error al validar el acceso');
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

      // Usamos el cliente anónimo para obtener el libro
      const { data: libroData, error: libroError } = await supabase
        .from('libro_pdf')
        .select('titulo, archivo_url')
        .eq('id', accessData.libro_id)
        .single();

      console.log('Datos del libro:', libroData);

      if (libroError) {
        console.error('Error al obtener libro:', libroError);
        if (libroError.code === 'PGRST301') {
          throw new Error('El libro no está disponible');
        }
        throw new Error('Error al obtener el libro');
      }

      if (!libroData) {
        throw new Error('Libro no encontrado');
      }

      // Si llegamos aquí, tenemos todos los datos necesarios
      setLibroData({
        titulo: libroData.titulo,
        archivo_url: libroData.archivo_url,
        email: accessData.email
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

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!libroData) return;

    if (email.toLowerCase() === libroData.email.toLowerCase()) {
      setIsEmailVerified(true);
    } else {
      setAuthError('El correo electrónico no coincide con el acceso autorizado');
    }
  };

  const handlePdfError = () => {
    setPdfError('Error al cargar el PDF. Por favor, intente de nuevo más tarde.');
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

  if (!isEmailVerified) {
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

          <form onSubmit={handleEmailVerification} className="space-y-6">
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

  const getGoogleViewerUrl = (pdfUrl: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true&chrome=false`;
  };

  // Función para inyectar CSS en el iframe para ocultar el botón de ventana externa
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = e.currentTarget;
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDocument) {
        // Crear un elemento de estilo
        const style = iframeDocument.createElement('style');
        style.textContent = `
          /* Ocultar todos los botones y controles del visor de Google Docs */
          .ndfHFb-c4YZDc-Wrql6b-SmKAyb,
          .ndfHFb-c4YZDc-Wrql6b,
          .ndfHFb-c4YZDc-to915-LgbsSe,
          .ndfHFb-c4YZDc-GSQQnc-LgbsSe,
          .ndfHFb-c4YZDc-MZArnb-Jh9lGc,
          .ndfHFb-c4YZDc-cYSp0e-DARUcf-RJLb9c,
          .ndfHFb-c4YZDc-vyDMJf-aZ2wEe,
          .ndfHFb-c4YZDc-j7LFlb,
          .ndfHFb-c4YZDc-Bz112c,
          .ndfHFb-c4YZDc-Wrql6b-qPSwhe,
          .ndfHFb-c4YZDc-n1UuX-Bz112c,
          .ndfHFb-c4YZDc-wicPId-fmcmS-MZArnb,
          [role="button"],
          [role="toolbar"],
          [role="menu"],
          [role="menuitem"],
          button,
          .goog-inline-block,
          .goog-flat-menu-button {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: fixed !important;
            top: -9999px !important;
            left: -9999px !important;
            width: 0 !important;
            height: 0 !important;
          }
        `;
        
        // Agregar el estilo al head del documento del iframe
        iframeDocument.head.appendChild(style);
      }
    } catch (error) {
      console.error("Error al inyectar CSS en el iframe:", error);
    }
  };

  // Usar useEffect para manejar el intervalo de eliminación de botones
  useEffect(() => {
    if (!iframeRef.current || !isEmailVerified) return;

    let interval: NodeJS.Timeout;
    let observer: MutationObserver;
    
    try {
      const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      
      if (iframeDocument) {
        // Función para ocultar el botón de ventana externa
        const hideExternalWindowButton = () => {
          try {
            // Buscar todos los elementos que podrían ser el botón de ventana externa
            const buttons = iframeDocument.querySelectorAll('button, [role="button"], .goog-inline-block, .goog-flat-menu-button');
            buttons.forEach(button => {
              // Corregir el tipo para evitar errores del linter
              const htmlElement = button as HTMLElement;
              
              // Verificar si el texto del botón contiene "Ventana externa"
              const buttonText = htmlElement.textContent || htmlElement.innerText || '';
              if (buttonText.includes('Ventana externa') || 
                  htmlElement.title?.includes('Ventana externa') || 
                  htmlElement.getAttribute('aria-label')?.includes('Ventana externa')) {
                htmlElement.style.display = 'none';
                htmlElement.style.visibility = 'hidden';
                htmlElement.style.opacity = '0';
                htmlElement.style.pointerEvents = 'none';
                htmlElement.style.position = 'fixed';
                htmlElement.style.top = '-9999px';
                htmlElement.style.left = '-9999px';
                htmlElement.style.width = '0';
                htmlElement.style.height = '0';
              }
            });
            
            // También ocultar elementos específicos por clase
            const specificButtons = iframeDocument.querySelectorAll('.ndfHFb-c4YZDc-Wrql6b, .ndfHFb-c4YZDc-to915-LgbsSe');
            specificButtons.forEach(button => {
              const htmlElement = button as HTMLElement;
              htmlElement.style.display = 'none';
              htmlElement.style.visibility = 'hidden';
              htmlElement.style.opacity = '0';
              htmlElement.style.pointerEvents = 'none';
            });
          } catch (error) {
            console.error("Error al eliminar botones:", error);
          }
        };
        
        // Ejecutar inmediatamente
        hideExternalWindowButton();
        
        // Configurar un intervalo para eliminar periódicamente el botón de ventana externa
        interval = setInterval(hideExternalWindowButton, 1000);
        
        // Configurar un observador de mutaciones para detectar cuando se añaden nuevos elementos al DOM
        observer = new MutationObserver((mutations) => {
          hideExternalWindowButton();
        });
        
        // Observar cambios en el DOM
        observer.observe(iframeDocument.body, {
          childList: true,
          subtree: true
        });
      }
    } catch (error) {
      console.error("Error al configurar el intervalo:", error);
    }
    
    // Limpiar el intervalo y el observador cuando el componente se desmonte
    return () => {
      if (interval) clearInterval(interval);
      if (observer) observer.disconnect();
    };
  }, [isEmailVerified]);

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-20">
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
                ref={iframeRef}
                src={getGoogleViewerUrl(pdfUrl)}
                className="w-full h-full"
                style={{
                  border: 'none',
                }}
                title={libroData.titulo}
                onError={handlePdfError}
                onLoad={handleIframeLoad}
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
          
          /* Ocultar todos los botones y controles del visor de Google Docs */
          .ndfHFb-c4YZDc-Wrql6b-SmKAyb,
          .ndfHFb-c4YZDc-Wrql6b,
          .ndfHFb-c4YZDc-to915-LgbsSe,
          .ndfHFb-c4YZDc-GSQQnc-LgbsSe,
          .ndfHFb-c4YZDc-MZArnb-Jh9lGc,
          .ndfHFb-c4YZDc-cYSp0e-DARUcf-RJLb9c,
          .ndfHFb-c4YZDc-vyDMJf-aZ2wEe,
          .ndfHFb-c4YZDc-j7LFlb,
          .ndfHFb-c4YZDc-Bz112c,
          .ndfHFb-c4YZDc-Wrql6b-qPSwhe,
          .ndfHFb-c4YZDc-n1UuX-Bz112c,
          .ndfHFb-c4YZDc-wicPId-fmcmS-MZArnb,
          [role="button"],
          [role="toolbar"],
          [role="menu"],
          [role="menuitem"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: fixed !important;
            top: -9999px !important;
            left: -9999px !important;
            width: 0 !important;
            height: 0 !important;
          }
          
          /* Asegurar que el iframe permita interacción con el documento */
          iframe {
            pointer-events: auto !important;
          }
          
          /* Ocultar el botón de ventana externa específicamente */
          .ventana-externa,
          button[title="Ventana externa"],
          a[title="Ventana externa"],
          div[title="Ventana externa"],
          span[title="Ventana externa"],
          *[aria-label="Ventana externa"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: fixed !important;
            top: -9999px !important;
            left: -9999px !important;
            width: 0 !important;
            height: 0 !important;
          }

          @media (max-width: 640px) {
            .min-h-screen {
              padding-top: 0rem;
            }
          }
        `}
      </style>
    </div>
  );
} 