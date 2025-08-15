import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 获取当前用户
    const getUser = async () => {
      try {
        // 首先尝试从 URL 中获取会话信息
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setUser(session.user)
          console.log('Session found from URL:', session.user.email)
        } else {
          // 如果没有会话，尝试获取用户信息
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setLoading(false)
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

    const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign up user:', email)
      
      // 先尝试注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      })
      
      console.log('SignUp response:', { data, error })
      
      if (error) {
        console.log('SignUp error detected:', error.message)
        
        // 如果注册失败，检查是否是用户已存在的错误
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered') ||
            error.message.includes('already exists')) {
          
          console.log('User already exists, attempting auto login...')
          
          // 尝试自动登录
          const loginResult = await signIn(email, password, false)
          console.log('Auto login result:', loginResult)
          
          if (loginResult.error) {
            // 自动登录失败，返回登录错误
            console.log('Auto login failed, returning error')
            return { data: null, error: loginResult.error, autoLoginAttempted: true }
          } else {
            // 自动登录成功
            console.log('Auto login successful')
            return { data: loginResult.data, error: null, autoLoginAttempted: true }
          }
        } else {
          // 其他注册错误
          console.log('Other signup error, throwing error')
          throw error
        }
      }
      
      // 检查返回的数据，判断用户是否已经存在
      if (data?.user && !data.session) {
        // 如果返回了用户但没有session，说明用户已存在但需要确认邮箱
        console.log('User exists but email not confirmed, checking if we can login...')
        
        // 尝试自动登录
        const loginResult = await signIn(email, password, false)
        console.log('Auto login result for existing user:', loginResult)
        
        if (loginResult.error) {
          // 自动登录失败，返回登录错误
          console.log('Auto login failed for existing user, returning error')
          return { data: null, error: loginResult.error, autoLoginAttempted: true }
        } else {
          // 自动登录成功
          console.log('Auto login successful for existing user')
          return { data: loginResult.data, error: null, autoLoginAttempted: true }
        }
      }
      
      console.log('New user signup successful')
      return { data, error: null, autoLoginAttempted: false }
    } catch (error) {
      console.log('SignUp caught error:', error)
      return { data: null, error, autoLoginAttempted: false }
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // 如果用户选择记住我，设置session持久性
      if (rememberMe && data.session) {
        await supabase.auth.setSession(data.session)
      }
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      // 改进错误处理，提供更详细的错误信息
      if (error && typeof error === 'object' && 'message' in error) {
        return { data: null, error }
      }
      return { data: null, error: new Error('Unknown error occurred') }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const sendMagicLink = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=magiclink`,
        },
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendMagicLink,
  }
} 