export interface Product {
  id: string
  vendor_id?: string
  title: string
  slug?: string
  description?: string
  price_cents: number
  stock?: number
  images?: string[]
}
