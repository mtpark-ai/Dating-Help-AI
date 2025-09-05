import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { Database } from './database.types'

// Server Components 客户端
export const createServerSupabaseClient = () =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return await cookies().getAll()
        },
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies().set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

// Route Handlers 客户端
export const createRouteHandlerSupabaseClient = () =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return await cookies().getAll()
        },
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies().set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

// Middleware 客户端
export const createMiddlewareSupabaseClient = (request: NextRequest) => {
  console.log('[Middleware Supabase] Creating client with cookies:', {
    cookieNames: request.cookies.getAll().map(c => c.name),
    supabaseCookies: request.cookies.getAll()
      .filter(c => c.name.startsWith('sb-'))
      .map(c => ({ name: c.name, hasValue: !!c.value, valueLength: c.value?.length || 0 }))
  })
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = request.cookies.getAll()
          console.log('[Middleware Supabase] Getting all cookies:', {
            count: allCookies.length,
            supabaseCount: allCookies.filter(c => c.name.startsWith('sb-')).length
          })
          return allCookies
        },
        setAll(cookiesToSet) {
          try {
            console.log('[Middleware Supabase] Setting cookies:', {
              count: cookiesToSet.length,
              cookies: cookiesToSet.map(c => ({ name: c.name, hasValue: !!c.value }))
            })
            cookiesToSet.forEach(({ name, value }) =>
              // Middleware cookies.set only accepts name and value, not options
              request.cookies.set(name, value)
            )
          } catch (error) {
            console.warn('[Middleware Supabase] Error setting cookies:', error)
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// 通用服务端客户端（用于 API 路由等）
export const createServerSupabaseClientForAPI = () =>
  createRouteHandlerSupabaseClient()
