import { NextResponse } from 'next/server'
import * as users from '../../../../lib/users'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Admin check middleware
async function checkAdmin(req: Request) {
  const supabase = createMiddlewareClient({ req, cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  const isUserAdmin = await users.isAdmin(session.user.id)
  if (!isUserAdmin) {
    throw new Error('Forbidden: Admin only')
  }
  return session.user
}

// GET /api/admin/vendors/pending
export async function GET(req: Request) {
  try {
    await checkAdmin(req)
    const pendingVendors = await users.getPendingVendors()
    return NextResponse.json(pendingVendors)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorized') ? 401 : 403 })
  }
}