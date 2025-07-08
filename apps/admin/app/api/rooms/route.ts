import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: roomTypes, error } = await supabase
      .from("room_types")
      .select(`
        *,
        rooms (
          id,
          room_number,
          status
        )
      `)
      .order("price_per_night", { ascending: true })

    if (error) throw error

    // Přidat počet dostupných pokojů pro každý typ
    const roomTypesWithAvailability = roomTypes.map((roomType) => ({
      ...roomType,
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
