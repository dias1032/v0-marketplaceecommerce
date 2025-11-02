import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  // Protect /seller/* routes - require authentication and verification
  if (request.nextUrl.pathname.startsWith("/seller")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Allow access to onboarding and verification pages
    if (
      request.nextUrl.pathname === "/seller/onboarding" ||
      request.nextUrl.pathname === "/seller/verificacao" ||
      request.nextUrl.pathname.startsWith("/seller/verification")
    ) {
      return supabaseResponse
    }

    // Check if user has a verified store
    const { data: store } = await supabase.from("stores").select("id, is_verified").eq("seller_id", user.id).single()

    if (!store) {
      // No store found, redirect to onboarding
      const url = request.nextUrl.clone()
      url.pathname = "/seller/onboarding"
      return NextResponse.redirect(url)
    }

    if (!store.is_verified) {
      // Store exists but not verified, check verification status
      const { data: verification } = await supabase
        .from("seller_verifications")
        .select("status")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      const url = request.nextUrl.clone()

      if (!verification || verification.status === "rejected") {
        // No verification or rejected, redirect to verification page
        url.pathname = "/seller/verificacao"
        return NextResponse.redirect(url)
      } else if (verification.status === "pending") {
        // Verification pending, show status page
        url.pathname = "/seller/verification-status"
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect unauthenticated users from protected routes
  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/shop") &&
    !request.nextUrl.pathname.startsWith("/product") &&
    !request.nextUrl.pathname.startsWith("/loja") &&
    !request.nextUrl.pathname.startsWith("/termos") &&
    !request.nextUrl.pathname.startsWith("/privacidade") &&
    !request.nextUrl.pathname.startsWith("/sobre") &&
    !request.nextUrl.pathname.startsWith("/ajuda")
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
