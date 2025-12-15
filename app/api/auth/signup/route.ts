import { NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { createSession } from "@/lib/auth/session"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    // Check if user exists
    const existing = (await query("SELECT id FROM users WHERE email = ?", [email])) as any[]

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert user
    const result = (await query("INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)", [
      email,
      passwordHash,
      fullName,
      role === "seller" ? "seller" : "user",
    ])) as any

    const userId = result.insertId

    // Create session
    await createSession({
      id: userId.toString(),
      email,
      role: role === "seller" ? "seller" : "user",
    })

    return NextResponse.json({
      user: {
        id: userId,
        email,
        role: role === "seller" ? "seller" : "user",
        fullName,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
