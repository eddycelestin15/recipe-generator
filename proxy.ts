import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/auth/signout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/disclaimer",
  ]

  // Allow all API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => {
    return pathname === route || pathname.startsWith(`${route}/`)
  })

  // HANDLE UNAUTHENTICATED USERS
  if (!isAuthenticated) {
    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Redirect to signin with callback URL for all other routes
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin)

    // Store callback URL (use /dashboard for root path to avoid loops)
    const callbackUrl = pathname === "/" ? "/dashboard" : pathname
    signInUrl.searchParams.set("callbackUrl", callbackUrl)

    return NextResponse.redirect(signInUrl)
  }

  // HANDLE AUTHENTICATED USERS
  const onboardingCompleted = req.auth?.user?.onboardingCompleted ?? false

  // Redirect authenticated users away from auth pages (except onboarding and signout)
  if (
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password")
  ) {
    // If onboarding not completed, redirect to onboarding
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/auth/onboarding", req.nextUrl.origin))
    }

    // Otherwise redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  // Check if user has completed onboarding
  if (!onboardingCompleted && pathname !== "/auth/onboarding") {
    // Only redirect if not on onboarding page and not on API/public routes
    if (!isPublicRoute && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/auth/onboarding", req.nextUrl.origin))
    }
  }

  // Redirect root path to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder and images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
