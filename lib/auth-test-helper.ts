/**
 * Helper functions to test and validate auth configuration
 * This file helps debug and test the refresh token fixes
 */

import { supabase, clearAllSessionStorage, validateSessionToken } from './supabase'

export async function testAuthConfiguration() {
  console.log('🧪 Testing auth configuration...')
  
  // Test 1: Check Supabase client initialization
  console.log('1. Supabase client config:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    client: !!supabase ? '✅ Created' : '❌ Failed'
  })
  
  // Test 2: Check storage availability
  if (typeof window !== 'undefined') {
    console.log('2. Storage availability:', {
      localStorage: {
        available: !!window.localStorage,
        canWrite: testStorageWrite('localStorage')
      },
      sessionStorage: {
        available: !!window.sessionStorage, 
        canWrite: testStorageWrite('sessionStorage')
      },
      cookies: {
        enabled: navigator.cookieEnabled,
        canWrite: testCookieWrite()
      }
    })
    
    // Test 3: Check for existing session data
    console.log('3. Existing session data:', {
      localStorage: Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.includes('supabase')),
      cookies: document.cookie.split(';').filter(c => c.includes('sb-')).map(c => c.split('=')[0].trim())
    })
  }
  
  // Test 4: Try to get current session
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('4. Current session status:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasRefreshToken: !!session?.refresh_token,
      expiresAt: session?.expires_at,
      error: error?.message
    })
  } catch (error) {
    console.log('4. Session check failed:', error)
  }
  
  // Test 5: Check auth state listener
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('5. Auth state change test:', { event, hasSession: !!session })
    })
    
    // Clean up subscription after a short delay
    setTimeout(() => {
      subscription.unsubscribe()
      console.log('5. Auth state listener: ✅ Working')
    }, 100)
  } catch (error) {
    console.log('5. Auth state listener failed:', error)
  }
}

function testStorageWrite(storageType: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage
    storage.setItem('_test', 'test')
    storage.removeItem('_test')
    return true
  } catch {
    return false
  }
}

function testCookieWrite(): boolean {
  try {
    document.cookie = '_test=test; path=/'
    const canRead = document.cookie.includes('_test=test')
    document.cookie = '_test=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    return canRead
  } catch {
    return false
  }
}

export async function simulateRefreshTokenError() {
  console.log('🧪 Simulating refresh token error...')
  
  // Clear existing session
  clearAllSessionStorage()
  
  // Try to refresh session when no refresh token exists
  try {
    const result = await supabase.auth.refreshSession()
    console.log('Refresh result:', result)
  } catch (error) {
    console.log('Expected refresh error:', error)
  }
}

export function logSessionStorage() {
  if (typeof window === 'undefined') {
    console.log('Server-side: Cannot access storage')
    return
  }
  
  console.log('📦 Current session storage state:', {
    localStorage: {
      keys: Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.includes('supabase')),
      entries: Object.keys(localStorage)
        .filter(k => k.startsWith('sb-') || k.includes('supabase'))
        .reduce((acc, key) => {
          const value = localStorage.getItem(key)
          acc[key] = {
            hasValue: !!value,
            length: value?.length || 0,
            isValidJson: value ? validateSessionToken(value) : false
          }
          return acc
        }, {} as Record<string, any>)
    },
    cookies: document.cookie.split(';')
      .filter(c => c.includes('sb-'))
      .map(c => {
        const [name, ...valueParts] = c.split('=')
        return {
          name: name?.trim(),
          hasValue: valueParts.length > 0,
          length: valueParts.join('=').length
        }
      })
  })
}