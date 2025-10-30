import { NextResponse } from 'next/server'
import * as products from '../../../lib/products'
import { isApprovedVendor } from '../../../lib/users'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/products
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      category_id: searchParams.get('category') ?? undefined,
      vendor_id: searchParams.get('vendor') ?? undefined,
      search: searchParams.get('q') ?? undefined,
      min_price: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
      max_price: searchParams.get('max') ? Number(searchParams.get('max')) : undefined
    }

    const data = await products.getProducts(filters)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// POST /api/products
export async function POST(req: Request) {
  try {
    const supabase = createMiddlewareClient({ req, cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isVendor = await isApprovedVendor(session.user.id)
    if (!isVendor) {
      return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })
    }

    const body = await req.json()
    const product = await products.createProduct(body, session.user.id)
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// PUT /api/products/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createMiddlewareClient({ req, cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const product = await products.updateProduct(params.id, body, session.user.id)
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createMiddlewareClient({ req, cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await products.deleteProduct(params.id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}