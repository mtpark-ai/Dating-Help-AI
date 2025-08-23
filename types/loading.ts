/**
 * Comprehensive loading state management types for authentication system
 * Provides type-safe loading states with operation-specific granularity
 */

// Base loading state interface
export interface LoadingState {
  isLoading: boolean
  operation?: AuthOperation
  message?: string
  progress?: number // 0-100 for progress indicators
}

// Specific authentication operations that can be tracked
export type AuthOperation = 
  | 'signIn'
  | 'signUp' 
  | 'signOut'
  | 'resetPassword'
  | 'sendMagicLink'
  | 'signInWithGoogle'
  | 'updateProfile'
  | 'fetchProfile'
  | 'verifyEmail'
  | 'refreshSession'
  | 'deleteAccount'

// Loading state for each operation
export type AuthLoadingStates = {
  [K in AuthOperation]: LoadingState
}

// Centralized loading context state
export interface AuthLoadingContextState {
  // Individual operation states
  states: Partial<AuthLoadingStates>
  
  // Global loading indicator
  globalLoading: boolean
  
  // Any operation currently running
  hasActiveOperations: boolean
  
  // Queue of operations for better UX
  operationQueue: AuthOperation[]
}

// Loading actions for reducer pattern
export type LoadingAction = 
  | { type: 'START_LOADING'; operation: AuthOperation; message?: string; progress?: number }
  | { type: 'UPDATE_PROGRESS'; operation: AuthOperation; progress: number; message?: string }
  | { type: 'FINISH_LOADING'; operation: AuthOperation }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_MESSAGE'; operation: AuthOperation; message: string }

// Loading hook return type
export interface UseLoadingReturn {
  // Current loading states
  loadingStates: AuthLoadingContextState
  
  // Action methods
  startLoading: (operation: AuthOperation, message?: string) => void
  finishLoading: (operation: AuthOperation) => void
  updateProgress: (operation: AuthOperation, progress: number, message?: string) => void
  setMessage: (operation: AuthOperation, message: string) => void
  clearAll: () => void
  
  // Utility getters
  isOperationLoading: (operation: AuthOperation) => boolean
  getOperationState: (operation: AuthOperation) => LoadingState | undefined
  getCurrentMessage: (operation: AuthOperation) => string | undefined
  getGlobalLoadingMessage: () => string | undefined
}

// UI Component props for loading states
export interface LoadingIndicatorProps {
  operation?: AuthOperation
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  showMessage?: boolean
  message?: string
  progress?: number
  className?: string
}

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  operation?: AuthOperation
  loadingText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  showSpinner?: boolean
  className?: string
}

export interface LoadingOverlayProps {
  isVisible: boolean
  operation?: AuthOperation
  message?: string
  progress?: number
  variant?: 'modal' | 'inline' | 'fullscreen'
  className?: string
  onCancel?: () => void
  showCancel?: boolean
}

// Operation messages for better UX
export const OPERATION_MESSAGES: Record<AuthOperation, { 
  start: string
  success: string
  progress?: string
}> = {
  signIn: {
    start: 'Signing you in...',
    success: 'Successfully signed in!',
  },
  signUp: {
    start: 'Creating your account...',
    success: 'Account created successfully!',
    progress: 'Verifying your information...'
  },
  signOut: {
    start: 'Signing you out...',
    success: 'Successfully signed out!',
  },
  resetPassword: {
    start: 'Sending password reset email...',
    success: 'Password reset email sent!',
  },
  sendMagicLink: {
    start: 'Sending magic link...',
    success: 'Magic link sent to your email!',
  },
  signInWithGoogle: {
    start: 'Connecting with Google...',
    success: 'Successfully connected with Google!',
    progress: 'Redirecting to Google...'
  },
  updateProfile: {
    start: 'Updating your profile...',
    success: 'Profile updated successfully!',
  },
  fetchProfile: {
    start: 'Loading your profile...',
    success: 'Profile loaded!',
  },
  verifyEmail: {
    start: 'Verifying your email...',
    success: 'Email verified successfully!',
  },
  refreshSession: {
    start: 'Refreshing session...',
    success: 'Session refreshed!',
  },
  deleteAccount: {
    start: 'Deleting your account...',
    success: 'Account deleted successfully!',
  },
}

// Error types for loading states
export interface LoadingError {
  operation: AuthOperation
  message: string
  code?: string
  retryable?: boolean
}

// Complete loading state with error handling
export interface EnhancedLoadingState extends LoadingState {
  error?: LoadingError | null
  startTime?: number
  duration?: number
}