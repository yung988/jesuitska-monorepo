"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Wifi, 
  Tv, 
  Coffee, 
  Users, 
  Bath, 
  Wind, 
  Car,
  ChevronLeft,
  ChevronRight,
  Bed,
  Home,
  Star,
  CircleDot
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getRoom, getRooms } from "@/lib/services/rooms"
import { HeroBooking } from "@/components/hero-booking"
import { getRoomImages, getRoomMainImage } from "@/lib/room-images"

// Interface for room data from Supabase
interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  room_types?: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    max_occupancy: number;
    amenities?: string[];
  };
}

// Room images are now handled by the centralized configuration

// Mapa ikon pro vybavení
const amenityIcons: { [key: string]: any } = {
  'WiFi': Wifi,
  'Bezplatné Wi-Fi': Wifi,
  'TV': Tv,
  'TV s plochou obrazovkou': Tv,
  'Kávovar': Coffee,
  'Elektrická konvice': Coffee,
  'Koupelna': Bath,
  'Vlastní koupelna': Bath,
  'Klimatizace': Wind,
  'Topení': Wind,
  'Parkování': Car,
  'Bezplatné parkování': Car,
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  
  const [room, setRoom] = useState<Room | null>(null)
  const [similarRooms, setSimilarRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    async function fetchRoomData() {
      try {
        // Fetch the main room
        const roomData = await getRoom(roomId)
        setRoom(roomData)
        
        // Fetch all rooms to find similar ones
        const allRooms = await getRooms()
        // Filter out the current room and get up to 3 similar rooms
        const similar = allRooms
          .filter(r => r.id !== roomId)
          .slice(0, 3)
        setSimilarRooms(similar)
      } catch (error) {
        console.error("Error fetching room data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [roomId])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === (roomImages.length - 1) ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? (roomImages.length - 1) : prev - 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Pokoj nebyl nalezen</h2>
          <Button asChild>
            <Link href="/#rooms">Zpět na výběr pokojů</Link>
          </Button>
        </div>
      </div>
    )
  }

  const amenitiesArray = room.room_types?.amenities || []
  const roomImages = getRoomImages(room.room_number)

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            asChild
            className="text-white hover:bg-white/20"
          >
            <Link href="/#rooms">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Zpět
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Gallery */}
      <section className="relative h-[70vh] bg-gray-100">
        <Image
          src={roomImages[currentImageIndex]}
          alt={room.room_number}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Image navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
          onClick={prevImage}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
          onClick={nextImage}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
        
        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {roomImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>

        {/* Room title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif mb-2">
              {room.room_types?.name || `Pokoj ${room.room_number}`}
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {room.room_number}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {room.floor}. patro
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {room.room_types?.description && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-serif mb-4">O pokoji</h2>
                    <p className="text-gray-600 leading-relaxed">
                      {room.room_types.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Amenities */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif mb-4">Vybavení</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesArray.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity.trim()] || CircleDot
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                          <span className="text-sm">{amenity.trim()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Room details */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-serif mb-4">Detaily pokoje</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Číslo pokoje</p>
                      <p className="font-medium">{room.room_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Patro</p>
                      <p className="font-medium">{room.floor}. patro</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kapacita</p>
                      <p className="font-medium">
                        {room.room_types?.max_occupancy || 'N/A'} {room.room_types?.max_occupancy === 1 ? 'osoba' : 'osoby'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Typ pokoje</p>
                      <p className="font-medium">{room.room_types?.name || 'Standardní pokoj'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking sidebar */}
            <div>
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Rezervovat pokoj</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">{room.room_types?.base_price?.toLocaleString('cs-CZ') || 'N/A'} Kč</span>
                    <span className="text-gray-500">/ noc</span>
                  </div>
                  
                  <Button 
                    asChild
                    className="w-full mb-4"
                  >
                    <Link href={`/rezervace/pokoj/${room.id}`}>
                      Rezervovat
                    </Link>
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Max. {room.room_types?.max_occupancy || 'N/A'} {room.room_types?.max_occupancy === 1 ? 'osoba' : 'osoby'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {room.room_types?.name || 'Standardní pokoj'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Similar rooms section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-serif mb-8 text-center">Další pokoje</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarRooms.map((similarRoom) => (
              <Card key={similarRoom.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={getRoomMainImage(similarRoom.room_number)}
                    alt={`Pokoj ${similarRoom.room_number}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Pokoj {similarRoom.room_number}</h3>
                  <p className="text-sm text-gray-500 mb-2">{similarRoom.room_types?.name || 'Standardní pokoj'}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="w-full"
                  >
                    <Link href={`/pokoje/${similarRoom.id}`}>
                      Zobrazit detail
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
