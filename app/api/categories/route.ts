import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const categories = await query<any[]>("SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC")

    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error("Erro ao listar categorias:", error)
    return NextResponse.json({ error: "Erro ao listar categorias" }, { status: 500 })
  }
}
