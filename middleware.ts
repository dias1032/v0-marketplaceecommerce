import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect /vendedor routes
  if (req.nextUrl.pathname.startsWith('/vendedor')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: vendor } = await supabase
      .from('vendors')
      .select('status')
      .eq('user_id', session.user.id)
      .single()

    if (!vendor || vendor.status !== 'approved') {
      return NextResponse.redirect(new URL('/vendedor/onboarding', req.url))
    }
  }

  return res
}

// Specify which routes should be protected
export const config = {
  matcher: ['/admin/:path*', '/vendedor/:path*']
}