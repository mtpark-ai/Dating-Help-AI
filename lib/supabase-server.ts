import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from './database.types'

// Server Components 客户端 - Enhanced with better error handling and auth options
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              })
            })
          } catch (error) {
            // Enhanced error logging for debugging
            console.warn('Server component cookie setting failed:', error)
            // This can be ignored if you have middleware refreshing sessions
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Let client handle URL session detection
        flowType: 'pkce'
      }
    }
  )
}

// Route Handlers 客户端 - Enhanced with consistent auth configuration
export const createRouteHandlerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              })
            })
          } catch (error) {
            console.warn('Route handler cookie setting failed:', error)
            // This can be ignored if you have middleware refreshing sessions
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // Route handlers can handle URL session detection
        flowType: 'pkce'
      }
    }
  )
}

// Middleware 客户端 - Enhanced with proper cookie handling
export const createMiddlewareSupabaseClient = (request: NextRequest) =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Don't try to set cookies in middleware - this causes issues
          // Just log them for debugging
          cookiesToSet.forEach(({ name, value }) => {
            console.log(`Middleware would set cookie: ${name}=${value?.substring(0, 10)}...`)
          })
        },
      },
      auth: {
        // Enable automatic token refresh but handle carefully
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable in middleware to avoid conflicts
        // Custom storage for middleware that reads from cookies but doesn't write
        storage: {
          getItem: (key: string) => {
            const cookie = request.cookies.get(key)
            return cookie?.value || null
          },
          setItem: (key: string, value: string) => {
            // Don't set items in middleware context - causes issues
            console.log(`Middleware would store: ${key}=${value?.substring(0, 10)}...`)
          },
          removeItem: (key: string) => {
            // Don't remove items in middleware context
            console.log(`Middleware would remove: ${key}`)
          }
        }
      }
    }
  )

// Alternative middleware client that supports response modification
export const createMiddlewareSupabaseClientWithResponse = (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              })
            } catch (error) {
              console.warn(`Failed to set cookie ${name}:`, error)
            }
          })
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    }
  )

  return { supabase, response }
}

// 通用服务端客户端（用于 API 路由等）
export const createServerSupabaseClientForAPI = async () =>
  await createRouteHandlerSupabaseClient()
