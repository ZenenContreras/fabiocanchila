import { createClient } from '@supabase/supabase-js'
import { setupCache } from './cache'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación más detallada de las variables de entorno
if (!supabaseUrl) {
  console.error('Error: VITE_SUPABASE_URL no está definida en las variables de entorno')
  throw new Error('VITE_SUPABASE_URL no configurada. Por favor, configura las variables de entorno correctamente.')
}
if (!supabaseKey) {
  console.error('Error: VITE_SUPABASE_ANON_KEY no está definida en las variables de entorno')
  throw new Error('VITE_SUPABASE_ANON_KEY no configurada. Por favor, configura las variables de entorno correctamente.')
}

// Crear cliente de Supabase usando exclusivamente las variables de entorno
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
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