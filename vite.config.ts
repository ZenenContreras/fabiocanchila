import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'

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
    target: 'esnext',
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'ui-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            return 'vendor';
          }
          // Agrupa los componentes de página en su propio chunk
          if (id.includes('/components/')) {
            return 'components';
          }
        }
      }
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
})