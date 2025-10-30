import { supabaseClient, createServiceClient } from './supabaseClient'
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js'
import { User } from '../types/user'

// Sign up a new user using Supabase Auth (email + password)
export async function signUp(email: string, password: string) {
  const resp = await supabaseClient.auth.signUp({ email, password })
  return resp
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  const resp = await supabaseClient.auth.signInWithPassword({ email, password })
  return resp
}

// Sign out current user
export async function signOut() {
  const resp = await supabaseClient.auth.signOut()
  return resp
}

// Get current user
export async function getUser(): Promise<SupabaseUser | null> {
  const { data } = await supabaseClient.auth.getUser()
  return data?.user ?? null
}

// Server-side helper to perform admin actions using service role key
export function getServiceClient() {
  return createServiceClient()
}

// Map Supabase user to our app User type (lightweight)
export function mapSupabaseUser(u: SupabaseUser | null): User | null {
  if (!u) return null
  return { id: u.id, email: u.email ?? '', name: u.user_metadata?.full_name ?? undefined, role: (u.user_metadata?.role as any) ?? undefined }
}

// NOTE: For auth state changes use the hook in `lib/useAuth.ts` which subscribes to Supabase's onAuthStateChange.
