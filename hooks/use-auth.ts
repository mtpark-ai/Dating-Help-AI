import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, hasValidSession, clearAllSessionStorage } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { handleAuthError, AuthErrorResult, isExpectedAuthError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import { getBaseUrl } from '@/lib/url-helper'
import { useAuthLoading } from './use-auth-loading'
import type { AuthOperation } from '@/types/loading'
import type {
  SignUpResult,
  SignInResult,
  SignOutResult,
  PasswordResetResult,
  MagicLinkResult,
  OAuthResult,
  BaseAuthHook,
  EmailPasswordCredentials,
  EmailOnlyCredentials
} from '@/types/auth'
import { isUser, isSession } from '@/types/auth'

export function useAuth(): BaseAuthHook & {
  authLoading: ReturnType<typeof useAuthLoading>
  isLoading: boolean
  getLoadingState: ReturnType<typeof useAuthLoading>['getOperationState']
  isOperationLoading: ReturnType<typeof useAuthLoading>['isOperationLoading']
} {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastError, setLastError] = useState<AuthErrorResult | null>(null)
  const router = useRouter()
  const authLoading = useAuthLoading()

  useEffect(() => {
    // Streamlined authentication initialization
    const initializeAuth = async () => {
      try {
        logger.authAttempt('auth_initialization')
        
        const { user, session, error } = await getCurrentUser()
        
        if (error && !isExpectedAuthError(error)) {
          const errorResult = handleAuthError(error, 'auth_initialization')
          logger.authError('auth_initialization', errorResult.error!, undefined, errorResult.logContext)
          setLastError(errorResult)
        }
        
        if (user && isUser(user)) {
          setUser(user)
          setLastError(null)
          logger.authSuccess('auth_initialization', user.id, user.email)
        } else {
          setUser(null)
        }
      } catch (error) {
        if (!isExpectedAuthError(error)) {
          const errorResult = handleAuthError(error, 'auth_initialization')
          setLastError(errorResult)
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Streamlined auth state change handler
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          logger.authAttempt('auth_state_change', session?.user?.email, { event })
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session && isSession(session) && isUser(session.user)) {
              setUser(session.user)
              setLastError(null)
              logger.authSuccess('auth_state_change', session.user.id, session.user.email, { event })
            } else {
              setUser(null)
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setLastError(null)
            clearAllSessionStorage()
          } else if (event === 'USER_UPDATED') {
            if (session && isSession(session) && isUser(session.user)) {
              setUser(session.user)
              setLastError(null)
            }
          }
          
          setLoading(false)
        } catch (error) {
          setLoading(false)
          const errorMessage = error instanceof Error ? error.message : String(error)
          
          if (errorMessage.toLowerCase().includes('refresh_token')) {
            setUser(null)
            setLastError(null)
            clearAllSessionStorage()
          } else if (error instanceof Error && !errorMessage.toLowerCase().includes('session')) {
            setUser(null)
            const errorResult = handleAuthError(error, 'auth_state_change')
            setLastError(errorResult)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 额外的 useEffect 来确保在页面加载时检测 URL 中的会话
  useEffect(() => {
    // 检查 URL 中是否有认证相关的参数
    const checkUrlForAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const hasAuthParams = urlParams.has('code') || urlParams.has('access_token') || urlParams.has('refresh_token')
      
      if (hasAuthParams) {
        console.log('Auth parameters detected in URL, waiting for auth state change...')
        // 如果有认证参数，等待认证状态变化
        // 不需要手动处理，Supabase 会自动处理
      }
    }

    // 只在客户端执行
    if (typeof window !== 'undefined') {
      checkUrlForAuth()
    }
  }, [])

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    logger.authAttempt('signup', email)
    authLoading.startLoading('signUp', 'Creating your account...')
    
    try {
      // 先尝试注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })
      
      if (error) {
        const errorResult = handleAuthError(error, 'signup', { email })
        
        // 如果注册失败，检查是否是用户已存在的错误
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered') ||
            error.message.includes('already exists')) {
          
          logger.authFailure('signup', 'user_exists_attempting_login', email, error as Error)
          
          // 尝试自动登录
          const loginResult = await signIn(email, password, false)
          
          if (loginResult.error) {
            // 自动登录失败，返回登录错误
            logger.authError('auto_login_after_signup', loginResult.error, email, loginResult.errorResult?.logContext)
            return { data: null, error: loginResult.error, success: false, autoLoginAttempted: true, errorResult: loginResult.errorResult }
          } else {
            // 自动登录成功
            logger.authSuccess('auto_login_after_signup', loginResult.data?.user?.id, email)
            return { data: loginResult.data, error: null, success: true, autoLoginAttempted: true }
          }
        } else {
          // 其他注册错误
          logger.authError('signup', errorResult.error!, email, errorResult.logContext)
          setLastError(errorResult)
          return { data: null, error: errorResult.error, success: false, autoLoginAttempted: false, errorResult }
        }
      }
      
      // 检查返回的数据，判断用户是否已经存在
      if (data?.user && !data.session) {
        // 如果返回了用户但没有session，说明是新用户注册成功，需要确认邮箱
        logger.authSuccess('signup', data.user.id, email, { requiresConfirmation: true })
        return { data, error: null, success: true, autoLoginAttempted: false }
      }
      
      // 如果返回了用户和session，说明用户已存在且登录成功
      if (data?.user && data.session) {
        logger.authSuccess('signup_with_immediate_login', data.user.id, email)
        return { data, error: null, success: true, autoLoginAttempted: true }
      }
      
      // 如果没有返回用户数据，但也没有错误，可能是特殊情况
      if (!data?.user) {
        const errorResult = handleAuthError(new Error('No user data returned'), 'signup', { email })
        logger.authError('signup', errorResult.error!, email, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, autoLoginAttempted: false, errorResult }
      }
      
      logger.authSuccess('signup', data.user.id, email)
      return { data, error: null, success: true, autoLoginAttempted: false }
    } catch (error) {
      const errorResult = handleAuthError(error, 'signup', { email })
      logger.authError('signup', errorResult.error!, email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, autoLoginAttempted: false, errorResult }
    } finally {
      authLoading.finishLoading('signUp')
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<SignInResult> => {
    logger.authAttempt('signin', email, { rememberMe })
    authLoading.startLoading('signIn', 'Signing you in...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        const errorResult = handleAuthError(error, 'signin', { email, rememberMe })
        logger.authFailure('signin', errorResult.error!.code, email, errorResult.error || undefined, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }
      
      // 如果用户选择记住我，设置session持久性
      if (rememberMe && data.session) {
        try {
          await supabase.auth.setSession(data.session)
          logger.info('Session persistence set', { userId: data.user?.id, email })
        } catch (sessionError) {
          logger.warn('Failed to set session persistence', { error: sessionError, email })
          // 不阻止登录流程，只是记录警告
        }
      }
      
      logger.authSuccess('signin', data.user?.id, email, { rememberMe })
      return { data, error: null, success: true }
    } catch (error) {
      const errorResult = handleAuthError(error, 'signin', { email, rememberMe })
      logger.authError('signin', errorResult.error!, email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      authLoading.finishLoading('signIn')
    }
  }

  const signOut = async (): Promise<SignOutResult> => {
    const currentUser = user
    logger.authAttempt('signout', currentUser?.email)
    authLoading.startLoading('signOut', 'Signing you out...')
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        const errorResult = handleAuthError(error, 'signout', { userId: currentUser?.id })
        logger.authError('signout', errorResult.error!, currentUser?.email, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }
      
      logger.authSuccess('signout', currentUser?.id, currentUser?.email)
      router.push('/login')
      return { data: null, error: null, success: true }
    } catch (error) {
      const errorResult = handleAuthError(error, 'signout', { userId: currentUser?.id })
      logger.authError('signout', errorResult.error!, currentUser?.email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      authLoading.finishLoading('signOut')
    }
  }

  const resetPassword = async (email: string): Promise<PasswordResetResult> => {
    logger.authAttempt('reset_password', email)
    authLoading.startLoading('resetPassword', 'Sending password reset email...')
    
    try {
      // Use robust environment detection from url-helper
      const baseUrl = getBaseUrl(typeof window !== 'undefined' ? window.location.host : undefined)
        
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/callback?type=recovery`,
      })
      
      if (error) {
        const errorResult = handleAuthError(error, 'reset_password', { email })
        logger.authFailure('reset_password', errorResult.error!.code, email, errorResult.error || undefined, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }
      
      logger.authSuccess('reset_password', undefined, email)
      return { data: null, error: null, success: true }
    } catch (error) {
      const errorResult = handleAuthError(error, 'reset_password', { email })
      logger.authError('reset_password', errorResult.error!, email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      authLoading.finishLoading('resetPassword')
    }
  }

  const sendMagicLink = async (email: string): Promise<MagicLinkResult> => {
    logger.authAttempt('send_magic_link', email)
    authLoading.startLoading('sendMagicLink', 'Sending magic link...')
    
    try {
      const baseUrl = getBaseUrl(typeof window !== 'undefined' ? window.location.host : undefined)
        
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?type=magiclink`,
          shouldCreateUser: true
        },
      })
      
      if (error) {
        const errorResult = handleAuthError(error, 'send_magic_link', { email })
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }
      
      logger.authSuccess('send_magic_link', undefined, email)
      return { data: null, error: null, success: true }
    } catch (error) {
      const errorResult = handleAuthError(error, 'send_magic_link', { email })
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      authLoading.finishLoading('sendMagicLink')
    }
  }

  const signInWithGoogle = async (): Promise<OAuthResult> => {
    logger.authAttempt('google_oauth', 'anonymous')
    authLoading.startLoading('signInWithGoogle', 'Connecting with Google...')
    
    try {
      const baseUrl = getBaseUrl(typeof window !== 'undefined' ? window.location.host : undefined)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback?type=google`,
          scopes: 'openid email profile'
        }
      })
      
      if (error) {
        const errorResult = handleAuthError(error, 'google_oauth')
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }
      
      // Store provider token when auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.provider_token) {
          localStorage.setItem('google_provider_token', session.provider_token)
        }
      })
      
      logger.authSuccess('google_oauth', 'anonymous')
      clearLastError()
      return { data, error: null, success: true, errorResult: undefined }
    } catch (error) {
      const errorResult = handleAuthError(error as any, 'google_oauth')
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      authLoading.finishLoading('signInWithGoogle')
    }
  }

  // Helper method to clear the last error
  const clearLastError = () => {
    setLastError(null)
  }


  return {
    user,
    loading,
    lastError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendMagicLink,
    signInWithGoogle,
    clearLastError,
    // Computed properties
    isAuthenticated: !!user,
    isGuest: !user,
    // Loading states
    authLoading,
    isLoading: authLoading.loadingStates.globalLoading,
    getLoadingState: authLoading.getOperationState,
    isOperationLoading: authLoading.isOperationLoading,
  }
} 