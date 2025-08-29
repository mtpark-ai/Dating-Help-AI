import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { Database } from './database.types'

// 检查是否为测试环境
const isTestEnv = process.env.NEXT_PUBLIC_ENV === 'test'

// 根据环境选择不同的配置
const getSupabaseUrl = () => isTestEnv 
  ? process.env.NEXT_PUBLIC_SUPABASE_TEST_URL!
  : process.env.NEXT_PUBLIC_SUPABASE_URL!

const getSupabaseAnonKey = () => isTestEnv
  ? process.env.NEXT_PUBLIC_SUPABASE_TEST_ANON_KEY!
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server Components 客户端
export const createServerSupabaseClient = () =>
  createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
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
    getSupabaseUrl(),
    getSupabaseAnonKey(),
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
export const createMiddlewareSupabaseClient = (request: NextRequest) =>
  createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value, options)
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

// 通用服务端客户端（用于 API 路由等）
export const createServerSupabaseClientForAPI = () =>
  createRouteHandlerSupabaseClient()