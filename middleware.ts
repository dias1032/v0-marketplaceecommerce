import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth_token")?.value

  // Public routes that don't need authentication
  const publicRoutes = ["/", "/shop", "/product", "/auth/login", "/auth/sign-up", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isApiRoute = pathname.startsWith("/api/")
  const isStaticFile = pathname.includes(".")

  // Allow public routes and static files
  if (isPublicRoute || isStaticFile) {
    return NextResponse.next()
  }

  // Allow API routes (they handle their own auth)
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?redirect=/admin", request.url))
    }
  }

  // Protect seller routes
  if (pathname.startsWith("/seller")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?redirect=/seller", request.url))
    }
  }

  // Protect user routes (cart, orders, profile)
  const protectedUserRoutes = ["/cart", "/checkout", "/orders", "/profile", "/meus-dados"]
  if (protectedUserRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL(`/auth/login?redirect=${pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
