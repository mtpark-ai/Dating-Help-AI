// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)

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

  console.log('Auth callback received:', { code: !!code, error, type, next })

  // 出错（链接过期/被拒等）
  if (error) {
    console.error('Auth callback error:', error, errorDesc)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDesc || error)}`, url.origin)
    )
  }

  const supabase = createRouteHandlerClient({ cookies })

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
      return NextResponse.redirect(new URL('/login?reason=session_error', url.origin))
    }
    console.log('Session set successfully, redirecting to:', next)
    return NextResponse.redirect(new URL(next, url.origin))
  }

  // 常规：使用 code 交换会话
  if (code) {
    console.log('Exchanging code for session')
    const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeErr) {
      console.error('Error exchanging code:', exchangeErr)
      return NextResponse.redirect(new URL('/login?reason=exchange_failed', url.origin))
    }
    console.log('Code exchanged successfully, redirecting to:', next)
    return NextResponse.redirect(new URL(next, url.origin))
  }

  // 没有任何有效信息
  console.log('No valid auth information found')
  return NextResponse.redirect(new URL('/login?reason=no_auth', url.origin))
}
