import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting room:", error)
      return NextResponse.json(
        { error: "Failed to delete room" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/rooms/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { error } = await supabase
      .from("rooms")
      .update({
        room_number: body.room_number,
        floor: body.floor,
        status: body.status,
      })
      .eq("id", params.id)

    if (error) {
      console.error("Error updating room:", error)
      return NextResponse.json(
        { error: "Failed to update room" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /api/rooms/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
