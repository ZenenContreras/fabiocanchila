import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    splitVendorChunkPlugin()
  ],
  build: {
    target: 'es2015', // Usa es2015 para mayor compatibilidad en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    },
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'utils': ['date-fns'],
          'supabase-vendor': ['@supabase/supabase-js'] // Cambio realizado aquí
        },
      } 
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false // Desactiva sourcemaps en producción para mejorar el rendimiento
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@supabase/supabase-js'
    ],
    esbuildOptions: {
      target: 'esnext' // Puedes probar con 'es2015' si esnext causa problemas
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  resolve: {
    preserveSymlinks: true // Manejo de cargas dinámicas en producción
  }
});
