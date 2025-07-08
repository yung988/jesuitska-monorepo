import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomTypeId, checkInDate, checkOutDate, adults, children, breakfastIncluded } = body

    if (!roomTypeId || !checkInDate || !checkOutDate || !adults) {
      return NextResponse.json({ error: "Chybí povinné údaje pro kalkulaci" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Získat cenu pokoje
    const { data: roomType, error } = await supabase
      .from("room_types")
      .select("price_per_night, name")
      .eq("id", roomTypeId)
      .single()

    if (error || !roomType) {
      return NextResponse.json({ error: "Typ pokoje nebyl nalezen" }, { status: 404 })
    }

    // Vypočítat počet nocí
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24),
    )

    if (nights <= 0) {
      return NextResponse.json({ error: "Neplatné datum" }, { status: 400 })
    }

    // Kalkulace cen
    const roomPrice = roomType.price_per_night * nights
    const breakfastPrice = breakfastIncluded ? 8 * adults * nights : 0
    const subtotal = roomPrice + breakfastPrice
    const taxRate = 0.21 // 21% DPH
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    return NextResponse.json({
      success: true,
      calculation: {
        roomType: roomType.name,
        nights,
        adults,
        children: children || 0,
        roomPrice,
        breakfastPrice,
        breakfastIncluded,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        priceBreakdown: {
          Ubytování: `${roomType.price_per_night} Kč × ${nights} nocí = ${roomPrice} Kč`,
          ...(breakfastIncluded && {
            Snídaně: `8 Kč × ${adults} osob × ${nights} nocí = ${breakfastPrice} Kč`,
          }),
          Mezisoučet: `${subtotal} Kč`,
          "DPH (21%)": `${taxAmount.toFixed(2)} Kč`,
          Celkem: `${totalAmount.toFixed(2)} Kč`,
        },
      },
    })
  } catch (error) {
    console.error("Price calculation error:", error)
    return NextResponse.json({ error: "Nepodařilo se vypočítat cenu" }, { status: 500 })
  }
}
