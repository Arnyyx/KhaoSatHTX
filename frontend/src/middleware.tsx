import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/provinces': ['admin'],
  '/wards': ['admin'],
  '/union': ['LMHTX'],
  '/surveys_list': ['HTX', 'QTD'],
  '/profile': ['HTX', 'QTD', 'LMHTX', 'admin'],
}

// Define default routes for each role
const defaultRoutes = {
  'admin': '/admin',
  'LMHTX': '/union',
  'HTX': '/profile',
  'QTD': '/profile',
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  // Handle login page
  if (path === '/login') {
    if (!token || !userRole) {
      return NextResponse.next();
    }
    // If authenticated, redirect to role's default page
    const defaultRoute = defaultRoutes[userRole as keyof typeof defaultRoutes];
    if (defaultRoute) {
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }
  }

  // Check authentication for protected routes
  if (!token || !userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role-based access for protected routes
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect to role's default page
        const defaultRoute = defaultRoutes[userRole as keyof typeof defaultRoutes];
        if (defaultRoute) {
          return NextResponse.redirect(new URL(defaultRoute, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/provinces/:path*',
    '/wards/:path*',
    '/union/:path*',
    '/surveys_list/:path*',
    '/profile/:path*',
    '/login',
  ],
}
