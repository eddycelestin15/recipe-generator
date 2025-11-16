import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes that don't require authentication (except homepage)
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

  // Routes that require authentication
  const protectedRoutes = [
    "/",  // Homepage requires authentication
    "/profile",
    "/settings",
    "/auth/onboarding",
  ]

  // API routes that require authentication
  const protectedApiRoutes = [
    "/api/users",
    "/api/fridge-items",
  ]

  // Allow all API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route === pathname) return true
    return pathname === route || pathname.startsWith(`${route}/`)
  })

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => {
    // Exact match for homepage
    if (route === "/" && pathname === "/") return true
    // Starts with for other routes
    if (route !== "/" && pathname.startsWith(route)) return true
    return false
  })
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages (except onboarding and signout)
  if (
    isAuthenticated &&
    (pathname.startsWith("/auth/signin") ||
      pathname.startsWith("/auth/signup") ||
      pathname.startsWith("/auth/forgot-password") ||
      pathname.startsWith("/auth/reset-password"))
  ) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
  }

  // Redirect unauthenticated users to signin (without callbackUrl for cleaner URLs)
  if (!isAuthenticated && (isProtectedRoute || isProtectedApiRoute)) {
    return NextResponse.redirect(new URL("/auth/signin", req.nextUrl.origin))
  }

  // Check if user has completed onboarding (except for onboarding page itself)
  if (
    isAuthenticated &&
    !req.auth?.user?.onboardingCompleted &&
    pathname !== "/auth/onboarding" &&
    !isPublicRoute &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/auth/onboarding", req.nextUrl.origin))
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
