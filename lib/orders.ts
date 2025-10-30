import { createServiceClient, supabaseClient } from './supabaseClient'
import { Order, OrderItem } from '../types/order'

interface CreateOrderData {
  user_id: string
  items: Array<{
    product_id: string
    qty: number
    price_cents: number
  }>
  total_cents: number
  coupon_code?: string
}

// Client-side order operations
export async function getMyOrders(user_id: string) {
  const { data, error } = await supabaseClient
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(title, images)
      )
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrderById(id: string, user_id: string) {
  const { data, error } = await supabaseClient
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(title, images)
      )
    `)
    .eq('id', id)
    .eq('user_id', user_id)
    .single()

  if (error) throw error
  return data
}

// Server-side order operations (requires service role)
export async function createOrder(orderData: CreateOrderData) {
  const supabase = createServiceClient()

  // Start transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      total_cents: orderData.total_cents,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Insert order items
  const items = orderData.items.map(item => ({
    order_id: order.id,
    ...item
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items)

  if (itemsError) {
    // Rollback order if items fail
    await supabase
      .from('orders')
      .delete()
      .eq('id', order.id)
    throw itemsError
  }

  // If coupon provided, update its usage
  if (orderData.coupon_code) {
    await supabase.rpc('increment_coupon_usage', { code: orderData.coupon_code })
  }

  // Calculate and save commission
  await calculateAndSaveCommission(order.id)

  return order
}

// Admin/vendor order operations
export async function getVendorOrders(vendor_id: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(title, vendor_id)
      )
    `)
    .eq('items.product.vendor_id', vendor_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  user_id: string,
  isAdmin: boolean
) {
  const supabase = createServiceClient()

  // Verify permissions
  if (!isAdmin) {
    const { data: order } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!order || order.user_id !== user_id) {
      throw new Error('Unauthorized: Cannot update this order')
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Log admin action
  if (isAdmin) {
    await supabase
      .from('admin_audit')
      .insert({
        admin_id: user_id,
        action: 'update_order_status',
        target_table: 'orders',
        target_id: id
      })
  }

  return data
}

// Internal helper to calculate commission
async function calculateAndSaveCommission(order_id: string) {
  const supabase = createServiceClient()

  // Get current commission rate
  const { data: commission } = await supabase
    .from('commissions')
    .select('percentage_decimal')
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  if (!commission) return // No commission configured

  // Calculate commission for each item
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order_id)

  if (!items?.length) return

  const totalCommission = items.reduce((sum, item) => {
    return sum + (item.price_cents * item.qty * commission.percentage_decimal)
  }, 0)

  // Save commission record
  await supabase
    .from('order_commissions')
    .insert({
      order_id,
      amount_cents: Math.round(totalCommission),
      rate_used: commission.percentage_decimal
    })
}