// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getBaseUrl } from '@/lib/url-helper'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  
  // Get the correct base URL for environment (critical for OAuth redirects)
  const baseUrl = getBaseUrl()

  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDesc = url.searchParams.get('error_description') || ''
  const type = url.searchParams.get('type') || ''
  const next =
    url.searchParams.get('next') ||
    (type === 'signup'
      ? '/signup-success'
      : type === 'recovery'
      ? '/login?reason=password_reset_success'
      : type === 'google'
      ? '/login-success?method=google'
      : type === 'magiclink'
      ? '/login-success?method=email'
      : '/dashboard')

  console.log('Auth callback received:', { 
    code: code ? `${code.substring(0, 8)}...` : null, 
    codeLength: code?.length || 0,
    error, 
    type, 
    next,
    fullUrl: url.toString()
  })

  // 出错（链接过期/被拒等）
  if (error) {
    console.error('Auth callback error:', error, errorDesc)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDesc || error)}`, baseUrl)
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        // 确保服务端能处理 PKCE 流程
        storageKey: 'sb-nlzqktgczzmzzresiqio-auth-token',
        // 添加调试模式
        debug: process.env.NODE_ENV === 'development',
      },
    }
  )

  // 罕见：若 query 直接带 token（多数客户端不会这样）
  const access_token = url.searchParams.get('access_token')
  const refresh_token = url.searchParams.get('refresh_token')
  if (access_token && refresh_token) {
    console.log('Setting session with tokens')
    const { error: setErr } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })
    if (setErr) {
      console.error('Error setting session with tokens:', setErr)
      return NextResponse.redirect(new URL('/login?reason=session_error', baseUrl))
    }
    console.log('Session set successfully, redirecting to:', next)
    return NextResponse.redirect(new URL(next, baseUrl))
  }

  // 常规：使用 code 交换会话
  if (code) {
    console.log('Exchanging code for session')
    console.log('Available cookies:', cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // 检查 PKCE 相关的 cookies
    const allCookies = cookieStore.getAll()
    const pkceCookies = allCookies.filter(c => 
      c.name.includes('verifier') || 
      c.name.includes('challenge') ||
      c.name.includes('pkce') ||
      c.name.startsWith('sb-') // Supabase cookies
    )
    console.log('All cookies:', allCookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0,
      startsWith_sb: c.name.startsWith('sb-')
    })))
    console.log('PKCE-related cookies:', pkceCookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0 
    })))
    
    // 特别检查预期的 PKCE cookie
    const expectedVerifierKey = 'sb-nlzqktgczzmzzresiqio-auth-token-code-verifier'
    const verifierCookie = allCookies.find(c => c.name === expectedVerifierKey)
    console.log(`Expected PKCE verifier cookie (${expectedVerifierKey}):`, {
      found: !!verifierCookie,
      hasValue: !!verifierCookie?.value,
      valueLength: verifierCookie?.value?.length || 0
    })
    
    try {
      const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeErr) {
        console.error('Error exchanging code:', exchangeErr)
        console.error('Error details:', {
          message: exchangeErr.message,
          status: exchangeErr.status,
          code: exchangeErr.code,
          name: exchangeErr.name
        })

        // 如果是 code verifier 相关错误，尝试重置认证状态并重新开始
        if (exchangeErr.message?.includes('code verifier') || 
            exchangeErr.message?.includes('code_verifier') ||
            exchangeErr.code === 'validation_failed') {
          console.log('PKCE validation failed - clearing auth state and redirecting to retry')
          
          // 清除可能损坏的认证状态
          try {
            await supabase.auth.signOut()
          } catch (signOutErr) {
            console.warn('Error during signOut cleanup:', signOutErr)
          }
          
          return NextResponse.redirect(
            new URL('/login?reason=pkce_failed&retry=true', baseUrl)
          )
        }
        
        return NextResponse.redirect(new URL('/login?reason=exchange_failed', baseUrl))
      }
      console.log('Code exchanged successfully, redirecting to:', next)
      return NextResponse.redirect(new URL(next, baseUrl))
    } catch (err) {
      console.error('Exception during code exchange:', err)
      
      // 检查是否是 PKCE 相关的异常
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage.includes('code verifier') || 
          errorMessage.includes('code_verifier') ||
          errorMessage.includes('PKCE')) {
        console.log('PKCE exception - clearing auth state and redirecting to retry')
        
        try {
          await supabase.auth.signOut()
        } catch (signOutErr) {
          console.warn('Error during signOut cleanup in catch:', signOutErr)
        }
        
        return NextResponse.redirect(
          new URL('/login?reason=pkce_exception&retry=true', baseUrl)
        )
      }
      
      return NextResponse.redirect(new URL('/login?reason=exchange_error', baseUrl))
    }
  }

  // 没有任何有效信息
  console.log('No valid auth information found')
  return NextResponse.redirect(new URL('/login?reason=no_auth', baseUrl))
}
