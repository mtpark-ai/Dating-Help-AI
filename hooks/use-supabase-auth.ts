'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  // 获取用户 profile 信息
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as any)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }, [])

  // 监听认证状态变化
  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error)
          setLoading(false)
          return
        }

        if (session) {
          setSession(session)
          setUser(session.user)
          
          // 获取用户 profile
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile as Profile | null)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error getting initial session:', err)
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // 获取用户 profile
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile as Profile | null)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // 注册（如果用户已存在则自动登录）
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
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
          
          console.log('User already exists, attempting auto login...')
          
          // 尝试自动登录 - 使用内联函数避免循环依赖
          const loginResult = await (async (email: string, password: string) => {
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
              })
              
              if (error) {
                return { data: null, error }
              }
              
              return { data, error: null }
            } catch (err) {
              const authError = err as AuthError
              return { data: null, error: authError }
            }
          })(email, password)
          
          if (loginResult.error) {
            // 自动登录失败，返回登录错误
            setError(loginResult.error)
            return { data: null, error: loginResult.error, autoLoginAttempted: true }
          } else {
            // 自动登录成功
            return { data: loginResult.data, error: null, autoLoginAttempted: true }
          }
        } else {
          // 其他注册错误
          setError(error)
          return { data: null, error }
        }
      }

      return { data, error: null, autoLoginAttempted: false }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { data: null, error: authError, autoLoginAttempted: false }
    } finally {
      setLoading(false)
    }
  }, [])

  // 登录
  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error)
        return { data: null, error }
      }

      // 如果用户选择记住我，设置会话持久性
      if (rememberMe && data.session) {
        await supabase.auth.setSession(data.session)
      }

      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { data: null, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // 登出
  const signOut = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error)
        return { error }
      }

      // 清除本地状态
      setUser(null)
      setSession(null)
      setProfile(null)
      
      return { error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // 重置密码
  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        setError(error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { data: null, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // 发送魔法链接
  const sendMagicLink = useCallback(async (email: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=magiclink`,
        },
      })

      if (error) {
        setError(error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { data: null, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  // 更新 profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error('No user logged in') }

    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id as any)
        .select()
        .single()

      if (error) {
        // 将 PostgrestError 转换为通用错误
        const genericError = new Error(error.message) as any
        genericError.status = error.code
        setError(genericError)
        return { data: null, error: genericError }
      }

      // 更新本地状态
      setProfile(data as unknown as Profile)
      
      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { data: null, error: authError }
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    // 状态
    user,
    session,
    profile,
    loading,
    error,
    
    // 方法
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendMagicLink,
    updateProfile,
    
    // 计算属性
    isAuthenticated: !!user,
    isGuest: !user,
  }
}
