import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { createSupabaseClient } from '../utils/supabase'

export const useSupabaseClient = () => {
  const { getToken } = useAuth()
  
  const supabaseClient = useMemo(() => {
    return createSupabaseClient(async () => {
      try {
        // Get the "supabase" template token from Clerk
        return await getToken({ template: 'supabase' })
      } catch (error) {
        return null
      }
    })
  }, [getToken])
  
  return supabaseClient
} 