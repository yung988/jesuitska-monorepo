"use server"

import { createServerClient } from "./supabase"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

export async function signIn(email: string, password: string) {
  const supabase = createServerClient()

  try {
    console.log("Attempting login for:", email)

    // Get user from admin_users table
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    console.log("User lookup result:", { user: user ? "found" : "not found", error })

    if (error || !user) {
      console.log("User not found or error:", error)
      return { error: "Neplatné přihlašovací údaje" }
    }

    // Verify password
    console.log("Verifying password...")
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log("Password valid:", isValidPassword)

    if (!isValidPassword) {
      return { error: "Neplatné přihlašovací údaje" }
    }

    // Update last login
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    console.log("Login successful for:", email)
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Chyba při přihlašování" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/login")
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}
