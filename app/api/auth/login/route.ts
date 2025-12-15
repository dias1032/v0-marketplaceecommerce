import { NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { createSession } from "@/lib/auth/session"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user
    const users = (await query("SELECT * FROM users WHERE email = ?", [email])) as any[]

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 })
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
