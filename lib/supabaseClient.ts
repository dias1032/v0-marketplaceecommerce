import { createClient } from '@supabase/supabase-js'

// Uses public keys for client-side operations. Keep service role key on server-side ONLY.
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

// Example server-side factory for situations where service role key is needed
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key)
}
