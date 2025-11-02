import { cookies } from "next/headers"
import { createClient } from "./server" // Importa o Arquivo 1 (lib/supabase/server.ts)

/**
 * Cria um cliente Supabase para Server Components.
 * Isso resolve o problema de login ao obter o cookieStore automaticamente do Next.js.
 * Use em qualquer Server Component que precisa acessar o usuário autenticado.
 */
export const createServerComponentClient = async () => {
  const cookieStore = cookies()
  return createClient(cookieStore)
}
