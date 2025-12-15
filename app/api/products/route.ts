import { NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { getSession } from "@/lib/auth/session"

// GET - List products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let sql = `
      SELECT p.*, s.store_name, s.slug as store_slug, c.name as category_name
      FROM products p
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `
    const params: any[] = []

    if (category) {
      sql += " AND c.slug = ?"
      params.push(category)
    }

    if (search) {
      sql += " AND (p.title LIKE ? OR p.description LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const products = (await query(sql, params)) as any[]

    // Parse JSON images
    const parsedProducts = products.map((p) => ({
      ...p,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images || [],
    }))

    return NextResponse.json({ products: parsedProducts })
  } catch (error) {
    console.error("Error listing products:", error)
    return NextResponse.json({ error: "Erro ao listar produtos" }, { status: 500 })
  }
}

// POST - Create product
export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session || (session.role !== "seller" && session.role !== "admin")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, price, original_price, stock, category_id, brand, size, color, condition, images } =
      body

    // Get user's store
    const stores = (await query("SELECT id FROM stores WHERE user_id = ? AND is_verified = TRUE", [
      session.id,
    ])) as any[]

    if (stores.length === 0) {
      return NextResponse.json({ error: "Você precisa ter uma loja verificada" }, { status: 403 })
    }

    const storeId = stores[0].id
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now()

    const result = (await query(
      `INSERT INTO products (store_id, category_id, title, slug, description, price, original_price, stock, brand, size, color, \`condition\`, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        storeId,
        category_id || null,
        title,
        slug,
        description || null,
        price,
        original_price || null,
        stock || 0,
        brand || null,
        size || null,
        color || null,
        condition || "new",
        JSON.stringify(images || []),
      ],
    )) as any

    return NextResponse.json({ success: true, productId: result.insertId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
