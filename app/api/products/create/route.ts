import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has verified store
    const { data: store } = await supabase.from("stores").select("id, is_verified").eq("seller_id", user.id).single()

    if (!store) {
      return NextResponse.json({ error: "No store found. Please complete onboarding." }, { status: 403 })
    }

    if (!store.is_verified) {
      return NextResponse.json({ error: "Store not verified. Please wait for approval." }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const stock = Number.parseInt(formData.get("stock") as string)
    const category_id = formData.get("category_id") as string
    const images = formData.getAll("images") as File[]

    // Validate required fields
    if (!name || !price || !stock) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload images to Supabase Storage
    const imageUrls: string[] = []

    for (const image of images) {
      if (image && image.size > 0) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${store.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, image, {
            contentType: image.type,
            upsert: false,
          })

        if (uploadError) {
          console.error("[v0] Image upload error:", uploadError)
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }
    }

    // Create product slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Insert product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        name,
        slug: `${slug}-${Date.now()}`,
        description,
        price,
        stock,
        category_id,
        images: imageUrls,
        is_active: true,
      })
      .select()
      .single()

    if (productError) {
      console.error("[v0] Product creation error:", productError)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
