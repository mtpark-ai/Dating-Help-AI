import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase-server'

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/conversation',
  '/upload-screenshot',
  '/pickup-lines',
  '/test-auth',
  '/admin'
]

// Define public routes that should be accessible without authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/login-success',
  '/login-failed',
  '/signup-success',
  '/signup-failed'
]

// Define auth callback routes that need special handling
const AUTH_CALLBACK_ROUTES = [
  '/auth/callback'
]

// Define API routes that should be handled separately
const API_ROUTES = [
  '/api'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, images, favicon, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/android-chrome') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/safari-pinned-tab') ||
    pathname.startsWith('/site.webmanifest') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.') && !pathname.includes('/api/')
  ) {
    return NextResponse.next()
  }

  // Handle API routes separately (they have their own auth logic)
  if (API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Handle auth callback routes (allow them to process auth tokens)
  if (AUTH_CALLBACK_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    // Create Supabase client for middleware
    const supabase = createMiddlewareSupabaseClient(request)
    
    // Use secure getUser() method instead of getSession()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && !error.message?.includes('session') && !error.message?.includes('missing')) {
      console.error('Middleware: Error getting user:', error)
    }

    const isAuthenticated = !!user
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )

    // If user is authenticated and trying to access login/signup pages, redirect to dashboard
    // if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    //   const dashboardUrl = new URL('/dashboard', request.url)
    //   return NextResponse.redirect(dashboardUrl)
    // }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      // Add the intended destination as a query parameter for post-login redirect
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Allow access to public routes regardless of auth status
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // For any other routes, check if user is authenticated
    if (!isAuthenticated && !isPublicRoute) {
      // If it's not explicitly a public route and user is not authenticated,
      // redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If we reach here, allow the request to proceed
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware: Unexpected error:', error)
    
    // In case of error, allow public routes and redirect protected routes to login
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )

    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isPublicRoute) {
      return NextResponse.next()
    }

    // For unknown routes, redirect to home page
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}