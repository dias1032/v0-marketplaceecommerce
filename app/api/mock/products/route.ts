import { type NextRequest, NextResponse } from "next/server"

// Mock products data
const mockProducts = [
  {
    id: "prod_001",
    title: "Camiseta Básica Premium",
    price: 49.9,
    images: ["/plain-white-tshirt.png"],
    stock: 50,
    seller_id: "seller_abc",
    description: "Camiseta 100% algodão, confortável e durável",
    category: "roupas",
  },
  {
    id: "prod_002",
    title: "Tênis Esportivo Pro",
    price: 299.9,
    images: ["/diverse-sneaker-collection.png"],
    stock: 25,
    seller_id: "seller_xyz",
    description: "Tênis ideal para corrida e atividades físicas",
    category: "calcados",
  },
  {
    id: "prod_003",
    title: "Mochila Executiva",
    price: 159.9,
    images: ["/colorful-backpack-on-wooden-table.png"],
    stock: 30,
    seller_id: "seller_abc",
    description: "Mochila com compartimento para notebook até 15 polegadas",
    category: "acessorios",
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")

  // Return single product if ID provided
  if (id) {
    const product = mockProducts.find((p) => p.id === id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  }

  // Return all products
  return NextResponse.json(mockProducts)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, price, images, stock, seller_id, description, category } = body

    if (!title || !price || !seller_id) {
      return NextResponse.json({ error: "Missing required fields: title, price, seller_id" }, { status: 400 })
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      title,
      price: Number.parseFloat(price),
      images: images || ["/diverse-products-still-life.png"],
      stock: stock || 0,
      seller_id,
      description: description || "",
      category: category || "outros",
    }

    // In a real implementation, this would save to database
    console.log("[v0] Mock product created:", newProduct)

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    }

    // In a real implementation, this would update in database
    console.log("[v0] Mock product updated:", { id, updates })

    return NextResponse.json({ success: true, message: "Product updated" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    }

    // In a real implementation, this would delete from database
    console.log("[v0] Mock product deleted:", id)

    return NextResponse.json({ success: true, message: "Product deleted" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
