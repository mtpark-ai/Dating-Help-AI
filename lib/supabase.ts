import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建类型安全的前端客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动刷新 token
    autoRefreshToken: true,
    // 持久化会话
    persistSession: true,
    // 检测会话变化
    detectSessionInUrl: true,
    // 添加更多会话管理选项
    flowType: 'pkce',
    // 添加调试信息
    debug: process.env.NODE_ENV === 'development',
    // Simplified storage configuration - let Supabase handle most storage logic
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        const isPkceKey = key.includes('code-verifier') || key.includes('pkce')
        const isSessionKey = key.includes('session') || key.includes('token')
        
        if (isPkceKey) {
          console.log(`🔍 PKCE storage get: ${key}`)
        }
        if (isSessionKey) {
          console.log(`🔍 Session storage get: ${key}`)
        }
        
        // Simple fallback chain
        try {
          const localValue = localStorage.getItem(key)
          if (localValue !== null) {
            if (isPkceKey) console.log(`✅ PKCE found in localStorage`)
            if (isSessionKey) console.log(`✅ Session found in localStorage`)
            return localValue
          }
        } catch (e) {
          console.warn(`localStorage failed for ${key}:`, e)
        }
        
        try {
          const sessionValue = sessionStorage.getItem(key)
          if (sessionValue !== null) {
            if (isPkceKey) console.log(`✅ PKCE found in sessionStorage`)
            if (isSessionKey) console.log(`✅ Session found in sessionStorage`)
            return sessionValue
          }
        } catch (e) {
          console.warn(`sessionStorage failed for ${key}:`, e)
        }
        
        if (isPkceKey || isSessionKey) {
          console.log(`❌ ${isPkceKey ? 'PKCE' : 'Session'} not found in any storage`)
        }
        
        return null
      },
      setItem: (key: string, value: string) => {
        const isPkceKey = key.includes('code-verifier') || key.includes('pkce')
        const isSessionKey = key.includes('session') || key.includes('token')
        
        if (isPkceKey) {
          console.log(`🔐 PKCE storage set: ${key} (${value.length} chars)`)
        }
        if (isSessionKey) {
          console.log(`🔐 Session storage set: ${key} (${value.length} chars)`)
        }
        
        // Always try localStorage first
        try {
          localStorage.setItem(key, value)
          if (isPkceKey) console.log(`✅ PKCE stored in localStorage`)
          if (isSessionKey) console.log(`✅ Session stored in localStorage`)
          
          // For PKCE, also store in cookies for server access
          if (isPkceKey) {
            try {
              const maxAge = 60 * 60 // 1 hour
              const secure = process.env.NODE_ENV === 'production' ? 'secure; ' : ''
              document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; ${secure}samesite=lax`
              console.log(`✅ PKCE also stored in cookies for server`)
            } catch (e) {
              console.warn(`PKCE cookie storage failed:`, e)
            }
          }
          
          return
        } catch (e) {
          console.warn(`localStorage failed for ${key}:`, e)
        }
        
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem(key, value)
          if (isPkceKey) console.log(`✅ PKCE stored in sessionStorage (fallback)`)
          if (isSessionKey) console.log(`✅ Session stored in sessionStorage (fallback)`)
        } catch (e) {
          console.error(`All storage methods failed for ${key}:`, e)
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
          // Clean up PKCE cookies if any
          if (key.includes('code-verifier') || key.includes('pkce')) {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
          }
        } catch (e) {
          console.warn(`Failed to remove ${key}:`, e)
        }
      }
    } : undefined
  },
  // 实时订阅配置
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})


// Safari-specific session refresh with fallback
export async function safariSessionRefresh() {
  try {
    // Always attempt refresh regardless of browser
    const { data, error } = await supabase.auth.refreshSession()
    
    // If refresh fails due to missing refresh token, check URL for tokens
    if (error && error.message?.includes('refresh_token')) {
      console.log('Refresh token missing, checking URL for auth tokens...')
      
      // Try to get session from URL if available (for OAuth callback scenarios)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Check both query params and hash fragments
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Found auth tokens in URL, setting session...')
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (!sessionError && sessionData?.session) {
            // Clean the URL after successful session establishment
            const cleanUrl = window.location.origin + window.location.pathname
            window.history.replaceState({}, '', cleanUrl)
            return { data: sessionData, error: null }
          }
        }
      }
    }
    
    return { data, error }
  } catch (error) {
    console.warn('Session refresh failed:', error)
    return { data: null, error: error as any }
  }
}

// Session validation helper - uses getUser() for security
export async function hasValidSession(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return false
    }
    
    // If we have a user, check session expiration from getSession (for expiry check only)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return false
    }
    
    return !isSessionExpired(session)
  } catch (error) {
    console.warn('Session validation error:', error)
    return false
  }
}

// Check if session is expired (with buffer)
function isSessionExpired(session: any): boolean {
  if (!session?.expires_at) return true
  
  const expiryTime = new Date(session.expires_at * 1000)
  const now = new Date()
  const bufferMinutes = 5 // Consider expired 5 minutes before actual expiry
  
  return expiryTime.getTime() - (bufferMinutes * 60 * 1000) <= now.getTime()
}

// Safe user retrieval using secure getUser() method
export async function getSafeUser() {
  try {
    console.log('🔍 getSafeUser: Starting user retrieval...')
    
    // Use secure getUser() method instead of getSession() for user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('🔍 getSafeUser: getUser() result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasError: !!userError,
      errorMessage: userError?.message,
      errorName: userError?.name
    })
    
    if (userError) {
      // Filter out expected auth-related errors that aren't actually errors
      const errorMessage = userError.message?.toLowerCase() || ''
      console.log('🔍 getSafeUser: Checking if error is expected:', { errorMessage })
      
      // Be more specific about which errors we consider "expected"
      if (errorMessage === 'auth session missing!' || 
          errorMessage.includes('no jwt') ||
          errorMessage.includes('jwt malformed') ||
          errorMessage.includes('invalid_token')) {
        // These are expected for unauthenticated users, not real errors
        console.log('✅ getSafeUser: Expected auth error, returning null user')
        return { user: null, session: null, error: null }
      }
      
      // For other errors, including potential temporary network issues, return the error
      console.warn('❌ getSafeUser: User authentication error:', userError.message)
      return { user: null, session: null, error: userError }
    }
    
    // If no authenticated user, return early
    if (!user) {
      console.log('ℹ️ getSafeUser: No user found, returning null')
      return { user: null, session: null, error: null }
    }
    
    console.log('✅ getSafeUser: User found, getting session info...')
    
    // Get session for additional metadata (expiry, etc.) - but rely on user for auth
    const { data: { session } } = await supabase.auth.getSession()
    
    // If session exists but is expired, try to refresh
    if (session && isSessionExpired(session)) {
      console.log('Session expired, attempting refresh...')
      
      // Use Safari-aware session refresh
      const { data: refreshData, error: refreshError } = await safariSessionRefresh()
      
      if (refreshError || !refreshData?.session) {
        // If refresh fails, treat as no session rather than error
        const errorMessage = refreshError?.message?.toLowerCase() || ''
        if (errorMessage.includes('refresh_token') || 
            errorMessage.includes('session') ||
            errorMessage.includes('expired')) {
          console.log('Session refresh failed - treating as logged out')
          return { user: null, session: null, error: null }
        }
        
        console.warn('Session refresh failed:', refreshError?.message)
        return { user: null, session: null, error: refreshError }
      }
      
      // Return authenticated user with refreshed session
      return { 
        user, 
        session: refreshData.session, 
        error: null 
      }
    }
    
    // Return authenticated user with current session (or null session)
    console.log('✅ getSafeUser: Returning user and session:', {
      hasUser: !!user,
      userId: user?.id,
      hasSession: !!session,
      sessionExpiry: session?.expires_at
    })
    return { user, session, error: null }
  } catch (error) {
    // Handle any unexpected errors gracefully
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
    
    if (errorMessage.includes('session') || 
        errorMessage.includes('missing') || 
        errorMessage.includes('auth') ||
        errorMessage.includes('expired')) {
      // Expected auth-related errors - treat as unauthenticated
      console.log('Auth-related error treated as unauthenticated:', errorMessage)
      return { user: null, session: null, error: null }
    }
    
    console.error('Unexpected error in safe user retrieval:', error)
    return { 
      user: null, 
      session: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

// 导出类型
export type { User } from '@supabase/supabase-js'
export type { Database } 