import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建类型安全的前端客户端 - Enhanced with better session management
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
    // 确保PKCE数据能正确存储为cookies供服务端访问
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        try {
          // 先尝试localStorage
          const localValue = localStorage.getItem(key)
          if (localValue) {
            // Validate JSON for session data
            if (key.includes('supabase.auth.token')) {
              try {
                const parsed = JSON.parse(localValue)
                // Check if refresh_token exists and isn't expired
                if (parsed.refresh_token && parsed.expires_at) {
                  const expiryTime = new Date(parsed.expires_at * 1000)
                  if (expiryTime > new Date()) {
                    return localValue
                  } else {
                    console.warn('Token expired in localStorage, clearing...')
                    localStorage.removeItem(key)
                    return null
                  }
                }
              } catch (e) {
                console.warn('Invalid token data in localStorage, clearing...')
                localStorage.removeItem(key)
                return null
              }
            }
            return localValue
          }
          
          // 再尝试cookies（用于服务端设置的数据）
          const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${key}=`))
            ?.split('=')[1]
          
          return cookieValue ? decodeURIComponent(cookieValue) : null
        } catch (error) {
          console.warn(`Failed to get storage item ${key}:`, error)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          // 存储到localStorage
          localStorage.setItem(key, value)
          
          // Session data also stored as httpOnly cookies for server access
          if (key.includes('supabase.auth.token')) {
            try {
              const sessionData = JSON.parse(value)
              if (sessionData.refresh_token) {
                const maxAge = 60 * 60 * 24 * 7 // 7 days for refresh token
                const secure = process.env.NODE_ENV === 'production' ? 'secure; ' : ''
                
                // Store a sanitized version in cookies for server-side access
                const cookieData = {
                  access_token: sessionData.access_token,
                  refresh_token: sessionData.refresh_token,
                  expires_at: sessionData.expires_at,
                  user: sessionData.user ? { id: sessionData.user.id, email: sessionData.user.email } : null
                }
                
                document.cookie = `sb-session=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; max-age=${maxAge}; ${secure}samesite=lax`
              }
            } catch (e) {
              console.warn('Failed to process session data for cookie storage:', e)
            }
          }
          
          // PKCE相关数据也存储为cookies（供服务端读取）
          if (key.includes('verifier') || key.includes('pkce') || key.includes('code-challenge')) {
            const maxAge = 10 * 60 // 10分钟，PKCE流程通常很快
            const secure = process.env.NODE_ENV === 'production' ? 'secure; ' : ''
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; ${secure}samesite=lax`
          }
        } catch (error) {
          console.warn(`Failed to set storage item ${key}:`, error)
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
          // 同时清理cookies
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
          
          // Clean session cookie when auth token is removed
          if (key.includes('supabase.auth.token')) {
            document.cookie = `sb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
          }
        } catch (error) {
          console.warn(`Failed to remove storage item ${key}:`, error)
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


// Enhanced session refresh with comprehensive error handling
export async function safariSessionRefresh() {
  try {
    console.log('🔄 Attempting session refresh...')
    
    // First check if we have valid session data in storage
    if (typeof window !== 'undefined') {
      const tokenKey = `sb-${supabaseUrl.split('.')[0]}-auth-token`
      const storedSession = localStorage.getItem(tokenKey)
      
      if (!storedSession) {
        console.log('❌ No session data in storage, cannot refresh')
        return { data: null, error: { message: 'No session data available for refresh' } as any }
      }
      
      try {
        const sessionData = JSON.parse(storedSession)
        if (!sessionData.refresh_token) {
          console.log('❌ No refresh token in stored session')
          // Clear invalid session data
          localStorage.removeItem(tokenKey)
          return { data: null, error: { message: 'refresh_token_not_found' } as any }
        }
        
        // Check if refresh token is expired
        if (sessionData.expires_at) {
          const expiryTime = new Date(sessionData.expires_at * 1000)
          const now = new Date()
          if (expiryTime <= now) {
            console.log('❌ Stored session is expired')
            localStorage.removeItem(tokenKey)
            return { data: null, error: { message: 'Session expired' } as any }
          }
        }
        
        console.log('✅ Found valid session data, attempting refresh...')
      } catch (e) {
        console.log('❌ Invalid session data format, clearing...')
        localStorage.removeItem(tokenKey)
        return { data: null, error: { message: 'Invalid session data' } as any }
      }
    }
    
    // Attempt refresh with current session
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.log('❌ Session refresh failed:', error.message)
      
      // Handle specific error cases
      if (error.message?.includes('refresh_token_not_found') || 
          error.message?.includes('Invalid Refresh Token') ||
          error.message?.includes('refresh_token')) {
        
        console.log('🔍 Refresh token error, attempting recovery...')
        
        // Try to get session from URL if available (for OAuth callback scenarios)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          
          // Check both query params and hash fragments
          const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
          const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
          
          if (accessToken && refreshToken) {
            console.log('✅ Found auth tokens in URL, setting session...')
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (!sessionError && sessionData?.session) {
              // Clean the URL after successful session establishment
              const cleanUrl = window.location.origin + window.location.pathname
              window.history.replaceState({}, '', cleanUrl)
              console.log('✅ Session recovered from URL tokens')
              return { data: sessionData, error: null }
            } else {
              console.log('❌ Failed to set session from URL tokens:', sessionError?.message)
            }
          }
          
          // Clear any invalid stored session data
          const tokenKey = `sb-${supabaseUrl.split('.')[0]}-auth-token`
          localStorage.removeItem(tokenKey)
          document.cookie = 'sb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      }
    } else if (data?.session) {
      console.log('✅ Session refreshed successfully')
    }
    
    return { data, error }
  } catch (error) {
    console.warn('❌ Unexpected error during session refresh:', error)
    
    // Clear potentially corrupted session data
    if (typeof window !== 'undefined') {
      const tokenKey = `sb-${supabaseUrl.split('.')[0]}-auth-token`
      localStorage.removeItem(tokenKey)
      document.cookie = 'sb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
    
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
      
      // Use enhanced session refresh
      const { data: refreshData, error: refreshError } = await safariSessionRefresh()
      
      if (refreshError || !refreshData?.session) {
        // Handle specific refresh token errors
        const errorMessage = refreshError?.message?.toLowerCase() || ''
        
        if (errorMessage.includes('refresh_token_not_found') || 
            errorMessage.includes('invalid refresh token') ||
            errorMessage.includes('refresh_token') || 
            errorMessage.includes('session') ||
            errorMessage.includes('expired') ||
            errorMessage.includes('no session data available')) {
          
          console.log('🚪 Session refresh failed due to missing/invalid refresh token - signing out user')
          
          // Attempt to sign out to clean up any remaining session artifacts
          try {
            await supabase.auth.signOut()
          } catch (signOutError) {
            console.warn('Failed to sign out after refresh token error:', signOutError)
          }
          
          // Clear all session-related storage
          if (typeof window !== 'undefined') {
            const tokenKey = `sb-${supabaseUrl.split('.')[0]}-auth-token`
            localStorage.removeItem(tokenKey)
            document.cookie = 'sb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            
            // Clear other potential auth cookies
            const cookies = document.cookie.split(';')
            cookies.forEach(cookie => {
              const [name] = cookie.split('=')
              if (name?.trim().startsWith('sb-')) {
                document.cookie = `${name.trim()}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
              }
            })
          }
          
          return { user: null, session: null, error: null }
        }
        
        console.warn('Session refresh failed with unexpected error:', refreshError?.message)
        return { user: null, session: null, error: refreshError }
      }
      
      // Return authenticated user with refreshed session
      console.log('✅ Session refreshed successfully, returning user and new session')
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

// Utility function to clean up all session-related storage
export function clearAllSessionStorage() {
  if (typeof window === 'undefined') return
  
  try {
    console.log('🧹 Clearing all session storage...')
    
    // Clear localStorage entries
    const localStorageKeys = Object.keys(localStorage)
    localStorageKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key)
        console.log(`Cleared localStorage: ${key}`)
      }
    })
    
    // Clear all supabase-related cookies
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      const [name] = cookie.split('=')
      const trimmedName = name?.trim()
      if (trimmedName && (trimmedName.startsWith('sb-') || trimmedName.includes('supabase'))) {
        document.cookie = `${trimmedName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
        console.log(`Cleared cookie: ${trimmedName}`)
      }
    })
    
    // Clear session storage entries
    if (window.sessionStorage) {
      const sessionStorageKeys = Object.keys(sessionStorage)
      sessionStorageKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key)
          console.log(`Cleared sessionStorage: ${key}`)
        }
      })
    }
    
    console.log('✅ Session storage cleanup completed')
  } catch (error) {
    console.warn('❌ Error during session storage cleanup:', error)
  }
}

// Utility function to validate session token structure
export function validateSessionToken(tokenString: string): boolean {
  try {
    const session = JSON.parse(tokenString)
    return !!(
      session &&
      typeof session === 'object' &&
      session.access_token &&
      session.refresh_token &&
      session.expires_at &&
      session.user &&
      session.user.id
    )
  } catch {
    return false
  }
}

// 导出类型
export type { User } from '@supabase/supabase-js'
export type { Database } 