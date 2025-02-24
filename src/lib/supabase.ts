import { createClient } from '@supabase/supabase-js'
import { setupCache } from './cache'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación más detallada de las variables de entorno
if (!supabaseUrl) {
  console.error('Error: VITE_SUPABASE_URL no está definida en las variables de entorno')
}
if (!supabaseKey) {
  console.error('Error: VITE_SUPABASE_ANON_KEY no está definida en las variables de entorno')
}

// Crear cliente de Supabase con valores por defecto si las variables no están disponibles
export const supabase = createClient(
  supabaseUrl || 'https://oarflxbkmorpaialaujg.supabase.co',
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcmZseGJrbW9ycGFpYWxhdWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMzQ1NzMsImV4cCI6MjA1MjkxMDU3M30.78UB-Ts63g9UJ6yWGLcva6SBSh0sDHnkEFYp0F7r2uQ',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'fabiocanchila'
      }
    },
    db: {
      schema: 'public'
    }
  }
)

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Retry mechanism for Supabase queries
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

// Initialize cache
setupCache()