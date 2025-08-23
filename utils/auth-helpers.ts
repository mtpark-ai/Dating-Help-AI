/**
 * Utility functions for authentication with enhanced type safety
 */

import type { User, Session } from '@supabase/supabase-js'
import type { 
  AuthState,
  Profile,
  AuthOperationResult,
  AuthStatus,
  isUser,
  isSession,
  isProfile
} from '@/types/auth'

// Type-safe authentication state validator
export function validateAuthState(state: Partial<AuthState>): AuthState {
  return {
    user: state.user && isUser(state.user) ? state.user : null,
    session: state.session && isSession(state.session) ? state.session : null,
    profile: state.profile && isProfile(state.profile) ? state.profile : null,
    loading: Boolean(state.loading),
    lastError: state.lastError || null,
    isAuthenticated: Boolean(state.user),
    isGuest: !Boolean(state.user)
  }
}

// Type-safe session validation
export function isValidSession(session: unknown): session is Session {
  return (
    typeof session === 'object' &&
    session !== null &&
    'user' in session &&
    'access_token' in session &&
    'expires_at' in session &&
    isUser((session as Session).user)
  )
}

// Type-safe user validation with enhanced checks
export function isValidUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    typeof (user as User).id === 'string' &&
    (user as User).id.length > 0 &&
    typeof (user as User).email === 'string' &&
    (user as User).email.includes('@')
  )
}

// Type-safe profile validation
export function isValidProfile(profile: unknown): profile is Profile {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    'id' in profile &&
    typeof (profile as Profile).id === 'string'
  )
}

// Type guard for authentication operation results
export function isSuccessResult<T>(
  result: AuthOperationResult<T>
): result is AuthOperationResult<T> & { success: true; data: T } {
  return result.success && result.data !== null
}

// Type guard for authentication errors
export function isErrorResult<T>(
  result: AuthOperationResult<T>
): result is AuthOperationResult<T> & { success: false; error: NonNullable<AuthOperationResult['error']> } {
  return !result.success && result.error !== null
}

// Get authentication status from state
export function getAuthStatus(state: AuthState): AuthStatus {
  if (state.loading) return AuthStatus.LOADING
  if (state.lastError) return AuthStatus.ERROR
  if (state.isAuthenticated) return AuthStatus.AUTHENTICATED
  return AuthStatus.UNAUTHENTICATED
}

// Type-safe email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Type-safe password strength validation
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  )
}

// Generate type-safe user display name
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest'
  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
}

// Check if user has required permissions (extensible for future use)
export function hasPermission(
  user: User | null,
  permission: string
): boolean {
  if (!user) return false
  
  // Basic implementation - can be extended based on your permission system
  const userRoles = user.app_metadata?.roles as string[] | undefined
  return userRoles?.includes(permission) || false
}

// Type-safe session expiry check
export function isSessionExpired(session: Session | null): boolean {
  if (!session || !session.expires_at) return true
  
  const expiryTime = new Date(session.expires_at * 1000)
  const now = new Date()
  const bufferMinutes = 5 // Consider session expired 5 minutes before actual expiry
  
  return expiryTime.getTime() - (bufferMinutes * 60 * 1000) <= now.getTime()
}

// Get remaining session time in minutes
export function getSessionRemainingTime(session: Session | null): number | null {
  if (!session || !session.expires_at) return null
  
  const expiryTime = new Date(session.expires_at * 1000)
  const now = new Date()
  const remainingMs = expiryTime.getTime() - now.getTime()
  
  return remainingMs > 0 ? Math.floor(remainingMs / (1000 * 60)) : 0
}

// Type-safe authentication context validator
export function createAuthContext(
  user: User | null,
  session: Session | null,
  profile: Profile | null,
  loading: boolean
): AuthState {
  // Validate that user and session are consistent
  const validUser = user && isValidUser(user) ? user : null
  const validSession = session && isValidSession(session) ? session : null
  
  // Ensure user and session consistency
  if (validUser && validSession && validUser.id !== validSession.user.id) {
    console.warn('User and session mismatch detected')
    return {
      user: null,
      session: null,
      profile: null,
      loading: false,
      lastError: null,
      isAuthenticated: false,
      isGuest: true
    }
  }
  
  const validProfile = profile && isValidProfile(profile) ? profile : null
  
  return {
    user: validUser,
    session: validSession,
    profile: validProfile,
    loading,
    lastError: null,
    isAuthenticated: Boolean(validUser),
    isGuest: !Boolean(validUser)
  }
}

// Error handling utilities with type safety
export function createTypeSafeError(
  message: string,
  code?: string,
  context?: Record<string, unknown>
): NonNullable<AuthOperationResult['error']> {
  return {
    message,
    code,
    context,
    timestamp: new Date().toISOString()
  } as NonNullable<AuthOperationResult['error']>
}

export function formatAuthError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'An unexpected error occurred'
}