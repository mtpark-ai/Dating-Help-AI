'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { handleAuthError, AuthErrorResult } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import type {
  Profile,
  SignUpResult,
  SignInResult,
  SignOutResult,
  PasswordResetResult,
  MagicLinkResult,
  ProfileUpdateResult,
  ExtendedAuthHook,
  ProfileUpdateData
} from '@/types/auth'
import { isUser, isSession, isProfile } from '@/types/auth'

export function useSupabaseAuth(): ExtendedAuthHook {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastError, setLastError] = useState<AuthErrorResult | null>(null)

  // 获取用户 profile 信息
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    logger.authAttempt('fetch_profile', undefined, { userId })
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        const errorResult = handleAuthError(error, 'fetch_profile', { userId })
        logger.authError('fetch_profile', errorResult.error!, undefined, errorResult.logContext)
        return null
      }

      if (data && isProfile(data)) {
        logger.authSuccess('fetch_profile', userId)
        return data
      }
      
      return null
    } catch (err) {
      const errorResult = handleAuthError(err, 'fetch_profile', { userId })
      logger.authError('fetch_profile', errorResult.error!, undefined, errorResult.logContext)
      return null
    }
  }, [])

  // 监听认证状态变化
  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      logger.authAttempt('get_initial_session')
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          const errorResult = handleAuthError(error, 'get_initial_session')
          logger.authError('get_initial_session', errorResult.error!, undefined, errorResult.logContext)
          setLastError(errorResult)
          setLoading(false)
          return
        }

        if (session && isSession(session)) {
          setSession(session)
          setUser(session.user)
          logger.authSuccess('get_initial_session', session.user.id, session.user.email)
          
          // 获取用户 profile
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        }
        
        setLoading(false)
      } catch (err) {
        const errorResult = handleAuthError(err, 'get_initial_session')
        logger.authError('get_initial_session', errorResult.error!, undefined, errorResult.logContext)
        setLastError(errorResult)
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.authAttempt('auth_state_change', session?.user?.email, { event })
        
        if (session && isSession(session)) {
          setSession(session)
          setUser(session.user)
          logger.authSuccess('auth_state_change', session.user.id, session.user.email, { event })
          
          // 获取用户 profile
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
          if (event === 'SIGNED_OUT') {
            logger.info('Auth state change: user signed out', { event })
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // 注册（如果用户已存在则自动登录）
  const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    logger.authAttempt('signup', email)
    
    try {
      setLoading(true)
      
      // 先尝试注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://www.datinghelpai.com/auth/callback',
        },
      })

      if (error) {
        // 如果注册失败，检查是否是用户已存在的错误
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered') ||
            error.message.includes('already exists')) {
          
          logger.authFailure('signup', 'user_exists_attempting_login', email, error)
          
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
          const errorResult = handleAuthError(error, 'signup', { email })
          logger.authError('signup', errorResult.error!, email, errorResult.logContext)
          setLastError(errorResult)
          return { data: null, error: errorResult.error, success: false, errorResult }
        }
      }

      logger.authSuccess('signup', data.user?.id, email, {
        requiresConfirmation: data?.user && !data.session
      })
      return { data, error: null, success: true, autoLoginAttempted: false }
    } catch (err) {
      const errorResult = handleAuthError(err, 'signup', { email })
      logger.authError('signup', errorResult.error!, email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, autoLoginAttempted: false, errorResult }
    } finally {
      setLoading(false)
    }
  }, [])

  // 登录
  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<SignInResult> => {
    logger.authAttempt('signin', email, { rememberMe })
    
    try {
      setLoading(true)
      
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

      // 如果用户选择记住我，设置会话持久性
      if (rememberMe && data.session) {
        try {
          await supabase.auth.setSession(data.session)
          logger.info('Session persistence set', { userId: data.user?.id, email })
        } catch (sessionError) {
          logger.warn('Failed to set session persistence', { error: sessionError, email })
        }
      }

      logger.authSuccess('signin', data.user?.id, email, { rememberMe })
      return { data, error: null, success: true }
    } catch (err) {
      const errorResult = handleAuthError(err, 'signin', { email, rememberMe })
      logger.authError('signin', errorResult.error!, email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      setLoading(false)
    }
  }, [])

  // 登出
  const signOut = useCallback(async (): Promise<SignOutResult> => {
    const currentUser = user
    logger.authAttempt('signout', currentUser?.email)
    
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        const errorResult = handleAuthError(error, 'signout', { userId: currentUser?.id })
        logger.authError('signout', errorResult.error!, currentUser?.email, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }

      // 清除本地状态
      setUser(null)
      setSession(null)
      setProfile(null)
      
      logger.authSuccess('signout', currentUser?.id, currentUser?.email)
      return { data: null, error: null, success: true }
    } catch (err) {
      const errorResult = handleAuthError(err, 'signout', { userId: currentUser?.id })
      logger.authError('signout', errorResult.error!, currentUser?.email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      setLoading(false)
    }
  }, [user])

  // 重置密码
  const resetPassword = useCallback(async (email: string): Promise<PasswordResetResult> => {
    logger.authAttempt('reset_password', email)
    
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        const errorResult = handleAuthError(error, 'reset_password', { email })
        logger.authFailure('reset_password', errorResult.error!.code, email, errorResult.error || undefined, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }

      logger.authSuccess('reset_password', undefined, email)
      return { data: null, error: null, success: true }
    } catch (err) {
      const errorResult = handleAuthError(err, 'reset_password', { email })
      logger.authError('reset_password', errorResult.error!, email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      setLoading(false)
    }
  }, [])

  // 发送魔法链接
  const sendMagicLink = useCallback(async (email: string): Promise<MagicLinkResult> => {
    logger.authAttempt('send_magic_link', email)
    
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=magiclink`,
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
    } catch (err) {
      const errorResult = handleAuthError(err, 'send_magic_link', { email })
      logger.authError('send_magic_link', errorResult.error!, email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      setLoading(false)
    }
  }, [])

  // 更新 profile
  const updateProfile = useCallback(async (updates: Partial<ProfileUpdateData>): Promise<ProfileUpdateResult> => {
    if (!user) {
      const errorResult = handleAuthError(new Error('No user logged in'), 'update_profile')
      logger.authError('update_profile', errorResult.error!, undefined, errorResult.logContext)
      return { data: null, error: errorResult.error, success: false, errorResult }
    }

    logger.authAttempt('update_profile', user.email, { userId: user.id })

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        const errorResult = handleAuthError(error, 'update_profile', { userId: user.id, updates })
        logger.authError('update_profile', errorResult.error!, user.email, errorResult.logContext)
        setLastError(errorResult)
        return { data: null, error: errorResult.error, success: false, errorResult }
      }

      // 更新本地状态
      if (data && isProfile(data)) {
        setProfile(data)
      }
      
      logger.authSuccess('update_profile', user.id, user.email)
      return { data: data as Profile, error: null, success: true }
    } catch (err) {
      const errorResult = handleAuthError(err, 'update_profile', { userId: user.id, updates })
      logger.authError('update_profile', errorResult.error!, user.email, errorResult.logContext)
      setLastError(errorResult)
      return { data: null, error: errorResult.error, success: false, errorResult }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Helper method to clear the last error
  const clearLastError = useCallback(() => {
    setLastError(null)
  }, [])

  return {
    // 状态
    user,
    session,
    profile,
    loading,
    lastError,
    
    // 方法
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendMagicLink,
    updateProfile,
    clearLastError,
    
    // 计算属性
    isAuthenticated: !!user,
    isGuest: !user,
  }
}