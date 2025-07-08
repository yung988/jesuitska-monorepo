import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestInfo, roomTypeId, checkInDate, checkOutDate, adults, children, specialRequests, breakfastIncluded } =
      body

    // Validace vstupních dat
    if (!guestInfo?.firstName || !guestInfo?.lastName || !guestInfo?.email) {
      return NextResponse.json({ error: "Chybí povinné údaje o hostovi" }, { status: 400 })
    }

    if (!roomTypeId || !checkInDate || !checkOutDate || !adults) {
      return NextResponse.json({ error: "Chybí povinné údaje o rezervaci" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Kontrola dostupnosti pokoje pro dané datum
    const { data: conflictingReservations } = await supabase
      .from("reservations")
      .select("id")
      .eq("room_id", roomTypeId)
      .not("status", "eq", "cancelled")
      .or(`check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate}`)

    if (conflictingReservations && conflictingReservations.length > 0) {
      return NextResponse.json({ error: "Pokoj není dostupný pro vybrané datum" }, { status: 400 })
    }

    // Zbytek kódu zůstává stejný...
    const { data: existingGuest } = await supabase.from("guests").select("id").eq("email", guestInfo.email).single()

    let guestId = existingGuest?.id

    if (!guestId) {
      const { data: newGuest, error: guestError } = await supabase
        .from("guests")
        .insert({
          first_name: guestInfo.firstName,
          last_name: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          nationality: guestInfo.nationality,
        })
        .select("id")
        .single()

      if (guestError) throw guestError
      guestId = newGuest.id
    }

    // Find available room of the requested type
    const { data: availableRoom } = await supabase
      .from("rooms")
      .select("id, room_types(price_per_night)")
      .eq("room_type_id", roomTypeId)
      .eq("status", "available")
      .limit(1)
      .single()

    if (!availableRoom) {
      return NextResponse.json({ error: "Žádné pokoje nejsou dostupné pro vybrané datum" }, { status: 400 })
    }

    // Calculate total amount
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24),
    )
    const roomPrice = availableRoom.room_types.price_per_night
    const breakfastPrice = breakfastIncluded ? 8 * adults * nights : 0
    const totalAmount = roomPrice * nights + breakfastPrice

    // Create reservation
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        guest_id: guestId,
        room_id: availableRoom.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults,
        children: children || 0,
        total_amount: totalAmount,
        special_requests: specialRequests,
        breakfast_included: breakfastIncluded,
        status: "confirmed",
      })
      .select()
      .single()

    if (reservationError) throw reservationError

    // Create invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    await supabase.from("invoices").insert({
      reservation_id: reservation.id,
      invoice_number: invoiceNumber,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: checkInDate,
      subtotal: totalAmount,
      total_amount: totalAmount,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      totalAmount,
      invoiceNumber,
      message: "Rezervace byla úspěšně vytvořena",
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Nepodařilo se vytvořit rezervaci" }, { status: 500 })
  }
}
