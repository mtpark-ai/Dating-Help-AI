import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Optimized client with minimal configuration following Supabase best practices
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})


// Simplified session management - let Supabase handle the complexity
export async function refreshAuthSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    return { data, error }
  } catch (error) {
    return { data: null, error: error as any }
  }
}

// Simple session validation
export async function hasValidSession(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return !error && !!user
  } catch {
    return false
  }
}

// Streamlined user retrieval
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, session: null, error: error }
    }
    
    const { data: { session } } = await supabase.auth.getSession()
    return { user, session, error: null }
  } catch (error) {
    return { user: null, session: null, error: error as any }
  }
}

// Simplified session cleanup
export function clearAllSessionStorage() {
  if (typeof window === 'undefined') return
  
  try {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=')
      const trimmedName = name?.trim()
      if (trimmedName?.startsWith('sb-')) {
        document.cookie = `${trimmedName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
      }
    })
    
    // Clear sessionStorage
    if (window.sessionStorage) {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.warn('Session cleanup error:', error)
  }
}

// Export types
export type { User } from '@supabase/supabase-js'
export type { Database } 