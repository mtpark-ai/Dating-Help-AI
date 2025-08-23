/**
 * Comprehensive type definitions for authentication system
 * Provides type-safe interfaces and utilities for authentication operations
 */

import type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import type { AuthErrorResult } from '@/lib/error-handler'
import type { AuthOperation } from './loading'

// Database profile type
export type Profile = Database['public']['Tables']['profiles']['Row']

// Enhanced user type that combines Supabase user with profile
export interface AuthenticatedUser extends User {
  profile?: Profile | null
}

// Authentication session with user profile
export interface AuthSession extends Session {
  user: AuthenticatedUser
}

// Standardized authentication result interface
export interface AuthOperationResult<T = unknown> {
  data: T | null
  error: AuthErrorResult['error'] | null
  success: boolean
  autoLoginAttempted?: boolean
  errorResult?: AuthErrorResult
}

// Specific result types for different operations
export interface SignUpResult extends AuthOperationResult<{ user: User | null; session: Session | null }> {}
export interface SignInResult extends AuthOperationResult<{ user: User | null; session: Session | null }> {}
export interface SignOutResult extends AuthOperationResult<null> {}
export interface PasswordResetResult extends AuthOperationResult<null> {}
export interface MagicLinkResult extends AuthOperationResult<null> {}
export interface ProfileUpdateResult extends AuthOperationResult<Profile> {}

// Authentication state interface
export interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  lastError: AuthErrorResult | null
  isAuthenticated: boolean
  isGuest: boolean
}

// Enhanced authentication state with additional metadata
export interface EnhancedAuthState extends AuthState {
  initialized: boolean
  lastActivity: Date | null
  sessionExpiry: Date | null
  loginMethod?: 'email' | 'magic_link' | 'oauth'
}

// Authentication method interfaces
export interface EmailPasswordCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface EmailOnlyCredentials {
  email: string
}

export interface ProfileUpdateData {
  display_name?: string
  avatar_url?: string
  bio?: string
  preferences?: Record<string, unknown>
  updated_at?: string
}

// Authentication hook interfaces
export interface BaseAuthHook {
  // State
  user: User | null
  loading: boolean
  lastError: AuthErrorResult | null
  
  // Methods
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<SignInResult>
  signOut: () => Promise<SignOutResult>
  resetPassword: (email: string) => Promise<PasswordResetResult>
  sendMagicLink: (email: string) => Promise<MagicLinkResult>
  clearLastError: () => void
  
  // Computed properties
  isAuthenticated: boolean
  isGuest: boolean
}

export interface ExtendedAuthHook extends BaseAuthHook {
  // Additional state
  session: Session | null
  profile: Profile | null
  
  // Additional methods
  updateProfile: (updates: Partial<ProfileUpdateData>) => Promise<ProfileUpdateResult>
}

// Type guards for authentication state validation
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    typeof (value as User).id === 'string'
  )
}

export const isProfile = (value: unknown): value is Profile => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as Profile).id === 'string'
  )
}

export const isSession = (value: unknown): value is Session => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'user' in value &&
    'access_token' in value &&
    isUser((value as Session).user)
  )
}

export const isAuthenticatedUser = (value: unknown): value is AuthenticatedUser => {
  return isUser(value)
}

export const isAuthError = (value: unknown): value is NonNullable<AuthErrorResult['error']> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  )
}

// Utility type for authentication operations
export type AuthOperationType = 
  | 'sign_up'
  | 'sign_in' 
  | 'sign_out'
  | 'password_reset'
  | 'magic_link'
  | 'profile_update'
  | 'session_refresh'

// Authentication event types for logging
export interface AuthEvent {
  type: AuthOperationType
  timestamp: Date
  success: boolean
  error?: string
  userId?: string
  email?: string
  metadata?: Record<string, unknown>
}

// Hook configuration
export interface AuthHookConfig {
  autoRefresh?: boolean
  persistSession?: boolean
  debugMode?: boolean
  retryAttempts?: number
  redirectOnAuth?: string
  redirectOnSignOut?: string
}

// Authentication provider context type
export interface AuthContextValue extends EnhancedAuthState {
  // Methods
  signUp: (credentials: EmailPasswordCredentials) => Promise<SignUpResult>
  signIn: (credentials: EmailPasswordCredentials) => Promise<SignInResult>
  signOut: () => Promise<SignOutResult>
  resetPassword: (credentials: EmailOnlyCredentials) => Promise<PasswordResetResult>
  sendMagicLink: (credentials: EmailOnlyCredentials) => Promise<MagicLinkResult>
  updateProfile: (updates: Partial<ProfileUpdateData>) => Promise<ProfileUpdateResult>
  refreshSession: () => Promise<void>
  clearLastError: () => void
  
  // Configuration
  config: AuthHookConfig
}

// Error handling types
export interface AuthValidationError {
  field: string
  message: string
  code: string
}

export interface AuthFormErrors {
  email?: AuthValidationError[]
  password?: AuthValidationError[]
  general?: AuthValidationError[]
}

// Common authentication patterns
export type AuthRedirectType = 'signup' | 'signin' | 'signout' | 'recovery' | 'magiclink'

export interface AuthCallbackData {
  type: AuthRedirectType
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  error?: string
  error_description?: string
}

// Utility types for authentication components
export interface AuthFormProps {
  onSuccess?: (result: SignUpResult | SignInResult) => void
  onError?: (error: AuthErrorResult['error']) => void
  loading?: boolean
  redirectTo?: string
  className?: string
}

export interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requireProfile?: boolean
  requiredRoles?: string[]
}

// Authentication status enum
export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error'
}

// Session management types
export interface SessionMetadata {
  createdAt: Date
  lastActivity: Date
  expiresAt: Date
  deviceInfo?: string
  ipAddress?: string
  userAgent?: string
}

export interface ManagedSession extends Session {
  metadata: SessionMetadata
}

// Advanced type utilities
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Authentication operation status
export interface AuthOperationStatus {
  operation: AuthOperation
  status: 'idle' | 'pending' | 'success' | 'error'
  result?: AuthOperationResult
  timestamp: Date
}

// Multi-factor authentication (for future extension)
export interface MFAChallenge {
  type: 'totp' | 'sms' | 'email'
  challengeId: string
  expiresAt: Date
}

export interface MFAVerification {
  challengeId: string
  code: string
}

// OAuth provider types (for future extension)
export type OAuthProvider = 'google' | 'github' | 'discord' | 'facebook' | 'twitter'

export interface OAuthSignInOptions {
  provider: OAuthProvider
  redirectTo?: string
  scopes?: string
}

// Export all types for easy importing
export type {
  User,
  Session,
  SupabaseAuthError,
  AuthErrorResult,
  AuthOperation,
  Database
}