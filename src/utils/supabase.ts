import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with Clerk token integration
export const createSupabaseClient = (getToken: () => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      // Use Clerk session token for authentication
      fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
        const clerkToken = await getToken()
        
        // Add Clerk token to Authorization header if available
        const headers = {
          ...options.headers,
          ...(clerkToken && { Authorization: `Bearer ${clerkToken}` })
        }

        return fetch(url, {
          ...options,
          headers
        })
      }
    }
  })
}

// Default client for non-authenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 