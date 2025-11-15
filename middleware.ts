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
  ]

  // Routes that require authentication
  const protectedRoutes = [
    "/profile",
    "/settings",
    "/auth/onboarding",
  ]

  // API routes that require authentication
  const protectedApiRoutes = [
    "/api/users",
    "/api/fridge-items",
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Redirect unauthenticated users to signin
  if (!isAuthenticated && (isProtectedRoute || isProtectedApiRoute)) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check if user has completed onboarding (except for onboarding page itself)
  if (
    isAuthenticated &&
    !req.auth?.user?.onboardingCompleted &&
    pathname !== "/auth/onboarding" &&
    !isPublicRoute &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/auth/onboarding", req.url))
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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
