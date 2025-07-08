import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const { data: reservation, error } = await supabase
      .from("reservations")
      .select(`
        *,
        guests (
          first_name,
          last_name,
          email,
          phone
        ),
        rooms (
          room_number,
          room_types (
            name,
            description,
            amenities
          )
        ),
        invoices (
          invoice_number,
          total_amount,
          status,
          due_date
        )
      `)
      .eq("id", params.id)
      .single()

    if (error || !reservation) {
      return NextResponse.json({ error: "Rezervace nebyla nalezena" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      reservation,
    })
  } catch (error) {
    console.error("Reservation lookup error:", error)
    return NextResponse.json({ error: "Nepodařilo se načíst rezervaci" }, { status: 500 })
  }
}
