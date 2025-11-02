import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// Importa o cliente Supabase do servidor (Arquivo 1: lib/supabase/server.ts)
import { createClient } from '@/lib/supabase/server' 

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 1. Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Obter e validar dados
    const { storeName, cnpj, legalName, phone, plan } = await request.json()

    if (!storeName || !cnpj || !legalName || !phone || !plan) {
      return new NextResponse(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Criar a loja (store)
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .insert({
        seller_id: user.id,
        name: storeName,
        cnpj: cnpj,
        legal_name: legalName,
        phone: phone,
        plan: plan,
        is_verified: false, // Inicia como não verificado
      })
      .select()
      .single()

    if (storeError) {
      console.error('Erro ao criar loja no Supabase:', storeError)
      // Mapeia o erro de banco de dados para um erro 400 ou 500
      return new NextResponse(JSON.stringify({ error: 'Falha ao salvar a loja no banco de dados.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 4. Atualizar o perfil do usuário para "pendente" e "seller"
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        verification_status: 'pending',
        role: 'seller', 
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Erro ao atualizar perfil no Supabase:', profileError)
      // Este erro não é fatal para o usuário, mas deve ser logado.
    }

    // 5. Sucesso
    return new NextResponse(JSON.stringify(storeData), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro interno da API de Onboarding:', error)
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
