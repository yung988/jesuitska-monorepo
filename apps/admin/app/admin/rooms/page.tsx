import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase"
import { Plus, Bed, Users, Wifi, Tv, Coffee, Car } from "lucide-react"
import Link from "next/link"

async function getRoomsData() {
  const supabase = createServerClient()

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(`
      *,
      room_types (
        name,
        description,
        capacity,
        price_per_night,
        amenities
      )
    `)
    .order("room_number")

  if (error) {
    console.error("Error fetching rooms:", error)
    return []
  }

  return rooms || []
}

function getStatusColor(status: string) {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800"
    case "occupied":
      return "bg-blue-100 text-blue-800"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800"
    case "out_of_order":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "available":
      return "Dostupný"
    case "occupied":
      return "Obsazený"
    case "maintenance":
      return "Údržba"
    case "out_of_order":
      return "Mimo provoz"
    default:
      return status
  }
}

function getAmenityIcon(amenity: string) {
  switch (amenity.toLowerCase()) {
    case "wi-fi":
      return <Wifi className="h-4 w-4" />
    case "tv":
      return <Tv className="h-4 w-4" />
    case "coffee/tea maker":
      return <Coffee className="h-4 w-4" />
    case "parking":
      return <Car className="h-4 w-4" />
    default:
      return <Bed className="h-4 w-4" />
  }
}

export default async function RoomsPage() {
  const rooms = await getRoomsData()

  const roomStats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa pokojů</h1>
          <p className="text-gray-600">Přehled a správa všech pokojů</p>
        </div>
        <Link href="/admin/rooms/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nový pokoj
          </Button>
        </Link>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celkem pokojů</p>
                <p className="text-2xl font-bold">{roomStats.total}</p>
              </div>
              <Bed className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dostupné</p>
                <p className="text-2xl font-bold text-green-600">{roomStats.available}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Obsazené</p>
                <p className="text-2xl font-bold text-blue-600">{roomStats.occupied}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Údržba</p>
                <p className="text-2xl font-bold text-yellow-600">{roomStats.maintenance}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room: any) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pokoj {room.room_number}</CardTitle>
                <Badge className={getStatusColor(room.status)}>{getStatusText(room.status)}</Badge>
              </div>
              <CardDescription>{room.room_types?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {room.room_types?.capacity} osob
                  </span>
                  <span className="font-semibold text-green-600">{room.room_types?.price_per_night} Kč/noc</span>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">Patro: {room.floor || "Přízemí"}</p>
                  <p>{room.room_types?.description}</p>
                </div>

                {room.room_types?.amenities && (
                  <div className="flex flex-wrap gap-2">
                    {room.room_types.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Upravit
                  </Button>
                  <Button variant={room.status === "available" ? "default" : "outline"} size="sm" className="flex-1">
                    {room.status === "available" ? "Rezervovat" : "Detail"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
