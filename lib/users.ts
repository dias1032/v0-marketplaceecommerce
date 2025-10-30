import { createServiceClient } from './supabaseClient'
import { User } from '../types/user'

// Admin-only user operations (requires service role)
export async function getUsers() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      vendor:vendors(
        store_name,
        slug,
        status
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateUser(
  id: string,
  updates: Partial<User>,
  admin_id: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Log admin action
  await supabase
    .from('admin_audit')
    .insert({
      admin_id,
      action: 'update_user',
      target_table: 'users',
      target_id: id
    })

  return data
}

export async function deleteUser(id: string, admin_id: string) {
  const supabase = createServiceClient()

  // Log admin action first (in case delete cascades)
  await supabase
    .from('admin_audit')
    .insert({
      admin_id,
      action: 'delete_user',
      target_table: 'users',
      target_id: id
    })

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// Vendor operations
export async function createVendor(
  user_id: string,
  data: {
    store_name: string
    slug: string
    bio?: string
  }
) {
  const supabase = createServiceClient()

  // First update user role
  await supabase
    .from('users')
    .update({ role: 'vendor' })
    .eq('id', user_id)

  // Then create vendor profile
  const { data: vendor, error } = await supabase
    .from('vendors')
    .insert({
      user_id,
      ...data,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return vendor
}

export async function approveVendor(
  vendor_id: string,
  admin_id: string
) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('vendors')
    .update({ status: 'approved' })
    .eq('id', vendor_id)
    .select()
    .single()

  if (error) throw error

  // Log admin action
  await supabase
    .from('admin_audit')
    .insert({
      admin_id,
      action: 'approve_vendor',
      target_table: 'vendors',
      target_id: vendor_id
    })

  return data
}

// Helper to check if user can access admin features
export async function isAdmin(user_id: string): Promise<boolean> {
  const supabase = createServiceClient()
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user_id)
    .single()

  return data?.role === 'admin'
}

// Helper to check if user is an approved vendor
export async function isApprovedVendor(user_id: string): Promise<boolean> {
  const supabase = createServiceClient()
  
  const { data } = await supabase
    .from('vendors')
    .select('status')
    .eq('user_id', user_id)
    .eq('status', 'approved')
    .single()

  return !!data
}