export interface OrderItem {
  product_id: string
  qty: number
  price_cents: number
}

export interface Order {
  id: string
  user_id: string
  total_cents: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
}
