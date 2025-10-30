import { NextResponse } from 'next/server'
import * as orders from '../../../lib/orders'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = createMiddlewareClient({ req, cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const orderData = {
      user_id: session.user.id,
      items: body.items,
      total_cents: body.total_cents,
      coupon_code: body.coupon_code
    }

    // Create order with items and apply commission
    const order = await orders.createOrder(orderData)

    // In a real app, here we would:
    // 1. Call payment gateway (e.g., Mercado Pago)
    // 2. Wait for webhook confirmation
    // 3. Update order status
    
    // For demo, we'll just mark it as paid
    await orders.updateOrderStatus(order.id, 'paid', session.user.id, false)

    return NextResponse.json({
      success: true,
      order_id: order.id
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}