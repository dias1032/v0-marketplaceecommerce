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

// POST /api/admin/vendors/[id]/approve
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await checkAdmin(req)
    const vendor = await users.approveVendor(params.id, adminUser.id)
    return NextResponse.json(vendor)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorized') ? 401 : 403 })
  }
}