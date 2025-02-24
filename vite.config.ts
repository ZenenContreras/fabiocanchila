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
    target: 'es2015', // Mantén esnext, pero prueba con 'es2015' si hay problemas
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
          'supabase': ['@supabase/supabase-js']
        },
      } 
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false // Usa sourcemaps en desarrollo para depuración, pero quítalos en producción para performances
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
      target: 'esnext' // Prueba con 'es2015' si esnext causa problemas
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  // Añade esta opción para manejar mejor las cargas dinámicas en producción
  resolve: {
    preserveSymlinks: true
  }
});