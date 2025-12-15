import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET - Buscar produto por ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const products = await query<any[]>(
      `SELECT p.*, s.store_name, s.slug as store_slug, s.logo_url as store_logo, c.name as category_name
       FROM products p
       LEFT JOIN stores s ON p.store_id = s.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id],
    )

    if (products.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    const product = products[0]
    product.images = typeof product.images === "string" ? JSON.parse(product.images) : product.images || []

    // Incrementar visualizações
    await query("UPDATE products SET views = views + 1 WHERE id = ?", [id])

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}

// PUT - Atualizar produto
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verificar se o produto pertence ao usuário
    const products = await query<any[]>(
      `SELECT p.* FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = ? AND s.user_id = ?`,
      [id, session.user.id],
    )

    if (products.length === 0 && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const updates: string[] = []
    const values: any[] = []

    const allowedFields = [
      "title",
      "description",
      "price",
      "original_price",
      "stock",
      "category_id",
      "brand",
      "size",
      "color",
      "condition",
      "images",
      "is_active",
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "images") {
          updates.push("images = ?")
          values.push(JSON.stringify(body[field]))
        } else if (field === "condition") {
          updates.push("`condition` = ?")
          values.push(body[field])
        } else {
          updates.push(`${field} = ?`)
          values.push(body[field])
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
    }

    values.push(id)

    await query(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, values)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

// DELETE - Remover produto
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar se o produto pertence ao usuário
    const products = await query<any[]>(
      `SELECT p.* FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = ? AND s.user_id = ?`,
      [id, session.user.id],
    )

    if (products.length === 0 && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    await query("DELETE FROM products WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao remover produto:", error)
    return NextResponse.json({ error: "Erro ao remover produto" }, { status: 500 })
  }
}
