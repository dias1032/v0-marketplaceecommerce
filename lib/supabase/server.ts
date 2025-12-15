import { createServerClient } from "@supabase/ssr"
import type { cookies } from "next/headers"

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch (error) {
          // O método `set` foi chamado de um Server Component.
          // Está tudo bem, mas devemos ignorar o erro.
        }
      },
    },
  })
}
