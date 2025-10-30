import { createServiceClient, supabaseClient } from './supabaseClient'
import { Product } from '../types/product'

// Types for filters and queries
interface ProductFilters {
  category_id?: string
  vendor_id?: string
  status?: 'draft' | 'active' | 'hidden'
  min_price?: number
  max_price?: number
  search?: string
  limit?: number
  offset?: number
}

// Client-side product operations (public data only)
export async function getProducts(filters: ProductFilters = {}) {
  let query = supabaseClient.from('products')
    .select('*, vendor:vendors(store_name, slug), category:categories(name, slug)')
    .eq('status', 'active')

  if (filters.category_id) query = query.eq('category_id', filters.category_id)
  if (filters.vendor_id) query = query.eq('vendor_id', filters.vendor_id)
  if (filters.min_price) query = query.gte('price_cents', filters.min_price)
  if (filters.max_price) query = query.lte('price_cents', filters.max_price)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)
  
  const { data, error } = await query
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*, vendor:vendors(store_name, slug), category:categories(name, slug)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Server-side admin/vendor operations (requires service role)
export async function createProduct(product: Omit<Product, 'id'>, vendor_id: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, vendor_id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Partial<Product>, user_id: string) {
  const supabase = createServiceClient()
  
  // First verify ownership or admin status
  const { data: product } = await supabase
    .from('products')
    .select('vendor_id, vendors!inner(user_id)')
    .eq('id', id)
    .single()

  if (!product || (product.vendors.user_id !== user_id)) {
    throw new Error('Unauthorized: Not product owner')
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string, user_id: string) {
  const supabase = createServiceClient()
  
  // First verify ownership or admin status
  const { data: product } = await supabase
    .from('products')
    .select('vendor_id, vendors!inner(user_id)')
    .eq('id', id)
    .single()

  if (!product || (product.vendors.user_id !== user_id)) {
    throw new Error('Unauthorized: Not product owner')
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Image upload helper (server-side)
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const supabase = createServiceClient()
  const fileName = `${productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
  
  const { data, error } = await supabase
    .storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(fileName)

  return publicUrl
}