import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/error',
  '/legal/terms',
  '/legal/privacy',
];

// API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

// Routes that require onboarding completion
const PROTECTED_ROUTES_EXCLUDE_ONBOARDING = ['/auth/onboarding'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Handle unauthenticated users
  if (!isAuthenticated) {
    if (isPublicRoute) {
      // Allow access to public routes
      return NextResponse.next();
    }

    // Redirect to signin and store the callback URL
    const signInUrl = new URL('/auth/signin', request.url);

    // Don't store callback for root path, use dashboard instead
    const callbackUrl = pathname === '/' ? '/dashboard' : pathname;
    signInUrl.searchParams.set('callbackUrl', callbackUrl);

    return NextResponse.redirect(signInUrl);
  }

  // Handle authenticated users
  const user = session.user;
  const onboardingCompleted = user.onboardingCompleted ?? false;

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth') && pathname !== '/auth/onboarding') {
    // If onboarding not completed, redirect to onboarding
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url));
    }

    // Otherwise redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle onboarding flow
  if (!onboardingCompleted && !PROTECTED_ROUTES_EXCLUDE_ONBOARDING.includes(pathname)) {
    // Redirect to onboarding if not completed (except for onboarding page itself)
    if (pathname !== '/auth/onboarding') {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url));
    }
  }

  // Handle root path - redirect to dashboard if authenticated
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - manifest.json and other PWA files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
};
