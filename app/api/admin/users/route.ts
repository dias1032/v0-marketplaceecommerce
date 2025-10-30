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

// GET /api/admin/users
export async function GET(req: Request) {
  try {
    const adminUser = await checkAdmin(req)
    const data = await users.getUsers()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorized') ? 401 : 403 })
  }
}

// PUT /api/admin/users/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await checkAdmin(req)
    const body = await req.json()
    const user = await users.updateUser(params.id, body, adminUser.id)
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorized') ? 401 : 403 })
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await checkAdmin(req)
    await users.deleteUser(params.id, adminUser.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorized') ? 401 : 403 })
  }
}