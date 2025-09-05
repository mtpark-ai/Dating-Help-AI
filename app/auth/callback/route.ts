// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getBaseUrl } from '@/lib/url-helper'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  
  // Get the correct base URL for environment (critical for OAuth redirects)
  // 在开发环境下强制使用 localhost
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : getBaseUrl()

  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDesc = url.searchParams.get('error_description') || ''
  const type = url.searchParams.get('type') || ''
  
  // Check for stored redirect path from OAuth flow
  const storedRedirect = url.searchParams.get('state') || url.searchParams.get('redirect') || ''
  
  const next =
    url.searchParams.get('next') ||
    storedRedirect ||
    (type === 'signup'
      ? '/dashboard?welcome=true'
      : type === 'recovery'
      ? '/login?reason=password_reset_success'
      : type === 'google'
      ? '/dashboard?method=google'
      : type === 'magiclink'
      ? '/dashboard?method=email'
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
    
    // 检查cookies状态
    const allCookies = cookieStore.getAll()
    const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'))
    console.log('Supabase cookies available:', supabaseCookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      length: c.value?.length || 0
    })))
    
    try {
      const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeErr) {
        console.error('❌ Code exchange failed:', {
          message: exchangeErr.message,
          status: exchangeErr.status,
          code: exchangeErr.code,
          name: exchangeErr.name,
          details: exchangeErr
        })
        
        // 根据错误类型提供更具体的重定向
        if (exchangeErr.message?.includes('code_verifier') || exchangeErr.message?.includes('PKCE')) {
          return NextResponse.redirect(new URL('/login?reason=pkce_failed&error=' + encodeURIComponent(exchangeErr.message), baseUrl))
        } else if (exchangeErr.message?.includes('expired') || exchangeErr.message?.includes('invalid')) {
          return NextResponse.redirect(new URL('/login?reason=code_expired&error=' + encodeURIComponent(exchangeErr.message), baseUrl))
        }
        
        return NextResponse.redirect(new URL('/login?reason=exchange_failed&error=' + encodeURIComponent(exchangeErr.message), baseUrl))
      }
      
      console.log('✅ Code exchanged successfully:', {
        hasUser: !!data?.user,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        hasSession: !!data?.session,
        redirectTo: next
      })
      
      return NextResponse.redirect(new URL(next, baseUrl))
    } catch (err) {
      console.error('❌ Exception during code exchange:', err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      return NextResponse.redirect(new URL('/login?reason=exchange_error&error=' + encodeURIComponent(errorMsg), baseUrl))
    }
  }

  // 没有任何有效信息
  console.log('No valid auth information found')
  return NextResponse.redirect(new URL('/login?reason=no_auth', baseUrl))
}
