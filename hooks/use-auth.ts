import { useState, useEffect } from 'react'
import { supabase, getSafeUser, hasValidSession } from '@/lib/supabase'
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
    // 初始化认证状态 - 使用强化的用户获取方法
    const initializeAuth = async () => {
      try {
        logger.authAttempt('auth_initialization')
        
        // 添加延迟以确保 Supabase 客户端完全初始化（特别是对 Safari）
        if (typeof window !== 'undefined') {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // 使用安全的用户获取方法，永远不会抛出 "Auth session missing" 错误
        const { user, session, error } = await getSafeUser()
        
        if (error) {
          // 使用新的辅助函数来判断是否是预期的认证错误
          if (!isExpectedAuthError(error)) {
            const errorResult = handleAuthError(error, 'auth_initialization')
            logger.authError('auth_initialization', errorResult.error!, undefined, errorResult.logContext)
            setLastError(errorResult)
          } else {
            // 预期的认证错误对未认证用户是正常的
            logger.info('No active session found - user not authenticated', {
              errorType: 'expected_auth_error',
              errorMessage: error.message
            })
          }
        }
        
        if (user && isUser(user)) {
          setUser(user)
          setLastError(null) // 清除之前的错误
          logger.authSuccess('auth_initialization', user.id, user.email, { 
            hasSession: !!session,
            sessionExpiry: session?.expires_at
          })
        } else {
          setUser(null)
          logger.info('No authenticated user found - initialization complete')
        }
      } catch (error) {
        // 处理任何意外错误
        if (!isExpectedAuthError(error)) {
          // 这是一个真正意外的错误
          const errorResult = handleAuthError(error, 'auth_initialization_unexpected')
          logger.authError('auth_initialization_unexpected', errorResult.error!, undefined, errorResult.logContext)
          setLastError(errorResult)
        } else {
          // 预期的认证相关错误都视为正常情况（用户未登录）
          logger.info('Auth initialization completed - treating as unauthenticated', {
            reason: 'expected_auth_error',
            errorMessage: error instanceof Error ? error.message : String(error)
          })
        }
        setUser(null)
      } finally {
        setLoading(false)
        logger.info('Auth initialization completed', { 
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
        })
      }
    }

    initializeAuth()

    // 监听认证状态变化 - 增强版本，更好地处理状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          logger.authAttempt('auth_state_change', session?.user?.email, { event })
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session && isSession(session) && isUser(session.user)) {
              setUser(session.user)
              setLastError(null) // 清除任何之前的错误
              logger.authSuccess('auth_state_change', session.user.id, session.user.email, { 
                event, 
                sessionExpiry: session.expires_at,
                tokenType: session.token_type 
              })
            } else {
              // 会话数据不完整或无效
              setUser(null)
              logger.warn('Auth state change: incomplete session data', { 
                event, 
                hasSession: !!session, 
                hasUser: !!session?.user 
              })
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setLastError(null) // 退出时清除错误
            logger.info('Auth state change: user signed out', { event })
          } else if (event === 'USER_UPDATED') {
            // 处理用户更新（邮箱确认、资料更改等）
            if (session && isSession(session) && isUser(session.user)) {
              setUser(session.user)
              setLastError(null) // 用户更新成功时清除错误
              logger.authSuccess('user_updated', session.user.id, session.user.email, { event })
            } else {
              // 用户更新但会话无效，可能是部分更新
              logger.warn('User updated but session invalid', { event, hasSession: !!session })
            }
          } else if (event === 'PASSWORD_RECOVERY') {
            logger.info('Password recovery initiated', { event })
          } else {
            // 处理其他认证事件
            logger.info('Auth state change: unknown event', { event, hasSession: !!session })
          }
          
          setLoading(false)
        } catch (error) {
          // 处理认证状态变化中的任何错误
          logger.error('Error in auth state change handler', error, { 
            event, 
            hasSession: !!session,
            errorMessage: error instanceof Error ? error.message : String(error)
          })
          
          // 确保在错误情况下不会卡在加载状态
          setLoading(false)
          
          // 如果是严重错误，清除用户状态
          if (error instanceof Error && !error.message.toLowerCase().includes('session')) {
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
      // Use robust environment detection from url-helper
      const baseUrl = getBaseUrl(typeof window !== 'undefined' ? window.location.host : undefined)
        
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?type=magiclink`,
        },
      })
      
      if (error) {
        const errorResult = handleAuthError(error, 'send_magic_link', { email })
        logger.authFailure('send_magic_link', errorResult.error!.code, email, errorResult.error || undefined, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }
      
      logger.authSuccess('send_magic_link', undefined, email)
      return { data: null, error: null, success: true }
    } catch (error) {
      const errorResult = handleAuthError(error, 'send_magic_link', { email })
      logger.authError('send_magic_link', errorResult.error!, email, errorResult.logContext)
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
      // Use robust environment detection from url-helper
      const baseUrl = getBaseUrl(typeof window !== 'undefined' ? window.location.host : undefined)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback?type=google`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
          scopes: 'email profile',
        },
      })
      
      if (error) {
        const errorResult = handleAuthError(error, 'google_oauth')
        logger.authFailure('google_oauth', errorResult.error!.code, 'anonymous', errorResult.error || undefined, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }
      
      logger.authSuccess('google_oauth', 'anonymous')
      clearLastError()
      return { data, error: null, success: true, errorResult: null }
    } catch (error) {
      const errorResult = handleAuthError(error as any, 'google_oauth')
      logger.authError('google_oauth', errorResult.error!, 'anonymous', errorResult.logContext || undefined)
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