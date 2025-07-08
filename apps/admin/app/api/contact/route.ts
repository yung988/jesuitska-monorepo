import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Chybí povinné údaje" }, { status: 400 })
    }

    // Zde byste mohli přidat logiku pro odeslání emailu
    // nebo uložení zprávy do databáze

    console.log("Nová zpráva z kontaktního formuláře:", {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Vaša zpráva byla úspěšně odeslána. Odpovíme vám co nejdříve.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Nepodařilo se odeslat zprávu" }, { status: 500 })
  }
}
