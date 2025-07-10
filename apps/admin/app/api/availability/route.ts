import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkInDate = searchParams.get("checkIn")
    const checkOutDate = searchParams.get("checkOut")
    const adults = Number.parseInt(searchParams.get("adults") || "1")
    const children = Number.parseInt(searchParams.get("children") || "0")

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Chybí datum příjezdu nebo odjezdu" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Získat všechny typy pokojů
    const { data: roomTypes, error: roomTypesError } = await supabase
      .from("room_types")
      .select(`
        id,
        name,
        description,
        price_per_night,
        capacity,
        amenities
      `)
      .gte("capacity", adults + children)

    if (roomTypesError) throw roomTypesError

    // Pro každý typ pokoje zkontrolovat dostupnost
    const availability = await Promise.all(
      roomTypes.map(async (roomType) => {
        // Najít pokoje tohoto typu
        const { data: rooms } = await supabase
          .from("rooms")
          .select("id")
          .eq("room_type_id", roomType.id)
          .eq("status", "available")

        if (!rooms || rooms.length === 0) {
          return {
            ...roomType,
            available: false,
            availableRooms: 0,
          }
        }

        // Zkontrolovat rezervace pro tyto pokoje v daném období
        const { data: conflictingReservations } = await supabase
          .from("reservations")
          .select("room_id")
          .in(
            "room_id",
            rooms.map((r) => r.id),
          )
          .not("status", "eq", "cancelled")
          .lt("check_in_date", checkOutDate)
          .gte("check_out_date", checkInDate)

        const occupiedRoomIds = new Set(conflictingReservations?.map((r) => r.room_id) || [])
        const availableRooms = rooms.filter((room) => !occupiedRoomIds.has(room.id))

        return {
          ...roomType,
          base_price: roomType.price_per_night,  // map to expected name
          max_occupancy: roomType.capacity,      // map to expected name
          available: availableRooms.length > 0,
          availableRooms: availableRooms.length,
          totalRooms: rooms.length,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      checkInDate,
      checkOutDate,
      guests: { adults, children },
      availability: availability.filter((room) => room.available),
    })
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json({ error: "Nepodařilo se zkontrolovat dostupnost" }, { status: 500 })
  }
}
