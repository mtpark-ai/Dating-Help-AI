// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getBaseUrl } from '@/lib/url-helper'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const baseUrl = getBaseUrl()

  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDesc = url.searchParams.get('error_description') || ''
  const type = url.searchParams.get('type') || ''
  
  // Improved routing logic
  const getRedirectPath = () => {
    const next = url.searchParams.get('next')
    if (next) return next
    
    switch (type) {
      case 'signup': return '/dashboard?welcome=true'
      case 'recovery': return '/login?reason=password_reset_success'
      case 'google': return '/dashboard?method=google'
      case 'magiclink': return '/dashboard?method=email'
      default: return '/dashboard'
    }
  }
  
  const redirectPath = getRedirectPath()

  // Handle OAuth errors
  if (error) {
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
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  // Handle direct token parameters (rare)
  const access_token = url.searchParams.get('access_token')
  const refresh_token = url.searchParams.get('refresh_token')
  if (access_token && refresh_token) {
    const { error: setErr } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })
    if (setErr) {
      return NextResponse.redirect(new URL('/login?reason=session_error', baseUrl))
    }
    return NextResponse.redirect(new URL(redirectPath, baseUrl))
  }

  // Handle authorization code exchange
  if (code) {
    try {
      const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeErr) {
        const reason = exchangeErr.message?.includes('code_verifier') ? 'pkce_failed' :
                     exchangeErr.message?.includes('expired') ? 'code_expired' :
                     'exchange_failed'
        
        return NextResponse.redirect(
          new URL(`/login?reason=${reason}&error=${encodeURIComponent(exchangeErr.message)}`, baseUrl)
        )
      }
      
      return NextResponse.redirect(new URL(redirectPath, baseUrl))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      return NextResponse.redirect(
        new URL(`/login?reason=exchange_error&error=${encodeURIComponent(errorMsg)}`, baseUrl)
      )
    }
  }

  // No valid auth information
  return NextResponse.redirect(new URL('/login?reason=no_auth', baseUrl))
}
