import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    const supabase = createServerClient()

    // Check if admin already exists
    const { data: existingAdmin } = await supabase.from("admin_users").select("id").eq("email", email).single()

    if (existingAdmin) {
      return NextResponse.json({ error: "Administrátor s tímto emailem již existuje" }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create admin
    const { error } = await supabase.from("admin_users").insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: "admin",
      is_active: true,
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Chyba při vytváření administrátora" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Administrátor byl úspěšně vytvořen",
      credentials: { email, password },
    })
  } catch (error) {
    console.error("Setup admin error:", error)
    return NextResponse.json({ error: "Neočekávaná chyba" }, { status: 500 })
  }
}
