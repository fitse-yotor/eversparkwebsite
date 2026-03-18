import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/about', '/contact', '/products', '/projects', '/solutions', '/blogs', '/login', '/api']
  const isPublicRoute = publicRoutes.some(route => 
    path === route || 
    path.startsWith(`${route}/`) ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.includes('.')
  )

  // Auth routes
  const isAuthRoute = path.startsWith('/auth')

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute && !isAuthRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated, check role-based access
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role

    // Redirect based on role if accessing root admin path
    if (path === '/admin' || path === '/admin/') {
      if (userRole === 'employee') {
        return NextResponse.redirect(new URL('/employee/dashboard', request.url))
      } else if (userRole === 'hr') {
        return NextResponse.redirect(new URL('/hr/dashboard', request.url))
      } else if (['admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    // Role-based route protection
    if (path.startsWith('/hr/')) {
      // HR routes - only hr, admin and super_admin
      if (!['hr', 'admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    if (path.startsWith('/employee/')) {
      // Employee routes - only employee role
      if (userRole !== 'employee') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    if (path.startsWith('/admin/')) {
      // Admin routes - only admin and super_admin
      if (!['admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
