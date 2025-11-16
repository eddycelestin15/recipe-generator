import { auth } from "./lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/signout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/legal/terms",
  "/legal/privacy",
  "/api/auth",
]

// Define API routes that should be excluded from middleware
const apiRoutes = [
  "/api/auth",
]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow all API routes to pass through
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === pathname) return true
    // Allow exact matches and routes starting with the public route
    return pathname === route || pathname.startsWith(`${route}/`)
  })

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access a protected route
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // User is authenticated, allow access
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
