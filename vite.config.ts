import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['framer-motion', 'lucide-react'],
          'blog': [
            './src/components/BlogList.tsx',
            './src/components/BlogPost.tsx'
          ],
          'services': [
            './src/components/ServiceDetail.tsx',
            './src/components/ServicesPage.tsx'
          ]
        }
      }
    },
    sourcemap: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion'
    ]
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
})