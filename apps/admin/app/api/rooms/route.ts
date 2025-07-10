import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: roomTypes, error } = await supabase
      .from("room_types")
      .select(`
        id,
        name,
        description,
        price_per_night,
        capacity,
        amenities,
        created_at,
        rooms (
          id,
          room_number,
          status
        )
      `)
      .order("price_per_night", { ascending: true })

    if (error) throw error

    // Přidat počet dostupných pokojů pro každý typ a mapovat sloupce
    const roomTypesWithAvailability = roomTypes.map((roomType) => ({
      ...roomType,
      base_price: roomType.price_per_night,  // map to expected name
      max_occupancy: roomType.capacity,      // map to expected name
      totalRooms: roomType.rooms.length,
      availableRooms: roomType.rooms.filter((room: any) => room.status === "available").length,
    }))

    return NextResponse.json({
      success: true,
      roomTypes: roomTypesWithAvailability,
    })
  } catch (error) {
    console.error("Room types error:", error)
    return NextResponse.json({ error: "Nepodařilo se načíst typy pokojů" }, { status: 500 })
  }
}
