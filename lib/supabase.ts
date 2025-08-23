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
    // Enhanced Safari-compatible storage configuration
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        try {
          // Try localStorage first
          const localValue = localStorage.getItem(key)
          if (localValue) return localValue
          
          // Fallback to sessionStorage for Safari private mode
          const sessionValue = sessionStorage.getItem(key)
          if (sessionValue) return sessionValue
          
          // Check if we have cookies as a last resort (Safari strict mode)
          const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${key}=`))
            ?.split('=')[1]
          
          return cookieValue || null
        } catch (error) {
          // If all storage methods fail, try sessionStorage only
          try {
            return sessionStorage.getItem(key)
          } catch {
            console.warn(`Unable to get item ${key} from any storage method`)
            return null
          }
        }
      },
      setItem: (key: string, value: string) => {
        let stored = false
        
        // Try localStorage first
        try {
          localStorage.setItem(key, value)
          stored = true
        } catch (localError) {
          console.warn('localStorage failed:', localError instanceof Error ? localError.message : String(localError))
        }
        
        // Try sessionStorage as fallback
        if (!stored) {
          try {
            sessionStorage.setItem(key, value)
            stored = true
          } catch (sessionError) {
            console.warn('sessionStorage failed:', sessionError instanceof Error ? sessionError.message : String(sessionError))
          }
        }
        
        // For Safari in strict mode, try to store minimal session info in cookies
        if (!stored && key.includes('session')) {
          try {
            // Only store essential session data in cookies (not the full session object)
            const sessionData = JSON.parse(value)
            if (sessionData?.access_token) {
              // Store a simplified session indicator
              document.cookie = `${key}_exists=true; path=/; max-age=${60 * 60 * 24}` // 24 hours
            }
          } catch (cookieError) {
            console.warn('Cookie fallback failed:', cookieError instanceof Error ? cookieError.message : String(cookieError))
          }
        }
        
        if (!stored) {
          console.warn(`Unable to persist ${key}: all storage methods failed`)
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
        } catch {
          // Silent fail
        }
        
        try {
          sessionStorage.removeItem(key)
        } catch {
          // Silent fail
        }
        
        // Clean up cookie indicator if it exists
        try {
          document.cookie = `${key}_exists=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
        } catch {
          // Silent fail
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

// Safari detection utility
function isSafari(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('edge')
}

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

// Session validation helper
export function hasValidSession(): Promise<boolean> {
  return supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.warn('Session validation error:', error.message)
      return false
    }
    return !!session && !!session.user && !isSessionExpired(session)
  })
}

// Check if session is expired (with buffer)
function isSessionExpired(session: any): boolean {
  if (!session?.expires_at) return true
  
  const expiryTime = new Date(session.expires_at * 1000)
  const now = new Date()
  const bufferMinutes = 5 // Consider expired 5 minutes before actual expiry
  
  return expiryTime.getTime() - (bufferMinutes * 60 * 1000) <= now.getTime()
}

// Safe user retrieval that checks session first and never throws "Auth session missing"
export async function getSafeUser() {
  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      // Filter out expected session-related errors that aren't actually errors
      const errorMessage = sessionError.message?.toLowerCase() || ''
      if (errorMessage.includes('session') || 
          errorMessage.includes('missing') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('expired')) {
        // These are expected for unauthenticated users, not real errors
        return { user: null, session: null, error: null }
      }
      
      console.warn('Unexpected session check error:', sessionError.message)
      return { user: null, session: null, error: sessionError }
    }
    
    // If no session, return early without calling getUser
    if (!session || !session.user) {
      return { user: null, session: null, error: null }
    }
    
    // If session exists but is expired, try to refresh
    if (isSessionExpired(session)) {
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
      
      // Validate refreshed session
      if (refreshData.session?.user) {
        return { 
          user: refreshData.session.user, 
          session: refreshData.session, 
          error: null 
        }
      } else {
        return { user: null, session: null, error: null }
      }
    }
    
    // Session is valid, return user from session
    return { user: session.user, session, error: null }
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