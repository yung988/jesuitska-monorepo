"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users, Maximize, Wifi, Coffee, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRooms } from "@/lib/services/rooms"
import { useToast } from "@/components/ui/use-toast"
import { getRoomImages } from "@/lib/room-images"

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
    image_urls?: string[];
  };
}

// Room images are now handled by the centralized configuration

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchRooms() {
      try {
        const roomsData = await getRooms()
        setRooms(roomsData)
        
        // Set the first room as active by default
        if (roomsData.length > 0) {
          setActiveTab(roomsData[0].id)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching rooms:', err)
        setError('Nepodařilo se načíst pokoje. Zkuste to prosím později.')
        toast({
          title: "Chyba při načítání pokojů",
          description: "Nepodařilo se načíst pokoje, zkuste to prosím později.",
          variant: "destructive"
        })
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const activeRoom = activeTab ? rooms.find((room) => room.id === activeTab) : null
  const roomImages = activeRoom ? getRoomImages(activeRoom.room_number) : []

  const nextImage = () => {
    setCurrentImage((prev) => (prev === (roomImages.length - 1) ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? (roomImages.length - 1) : prev - 1))
  }

  if (loading) {
    return (
      <section id="rooms" className="py-24 md:py-32 px-6 md:px-20 bg-cream/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-wider uppercase text-center mb-4">
            Pokoje
          </h2>
          <div className="w-24 h-px bg-dark-gray/30 mx-auto mb-12" />
          <p>Načítání pokojů...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="rooms" className="py-24 md:py-32 px-6 md:px-20 bg-cream/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-wider uppercase text-center mb-4">
            Pokoje
          </h2>
          <div className="w-24 h-px bg-dark-gray/30 mx-auto mb-12" />
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="rooms" className="py-24 md:py-32 px-6 md:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-wider uppercase mb-4">
            Naše pokoje
          </h2>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg">
            Nabízíme celkem 8 pokojů s kapacitou 20 lůžek. Každý pokoj má vlastní sociální
            zařízení a jedinečnou atmosféru.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {rooms.map((room) => (
            <Button
              key={room.id}
              variant="secondary"
              className={cn(
                "rounded-md px-4 py-2 transition-colors text-sm font-medium",
                activeTab === room.id && "bg-gray-900 text-white hover:bg-gray-800",
              )}
              onClick={() => {
                setActiveTab(room.id);
                setCurrentImage(0); // Reset image index when switching rooms
              }}
            >
              {room.room_number}
            </Button>
          ))}
        </div>

        {activeRoom && (
           <div className="grid md:grid-cols-2 gap-12 items-start">
             <div>
               <h3 className="text-2xl font-serif mb-6">{activeRoom.room_number}</h3>
               <p className="text-lg mb-10 leading-relaxed">{activeRoom.room_types?.description || 'Popis pokoje není k dispozici.'}</p>

               {activeRoom.room_types && (
                 <div className="space-y-3">
                   <div className="flex items-center gap-3">
                     <Users className="h-5 w-5 text-dark-gray" />
                     <span>Max. {activeRoom.room_types.max_occupancy} hosté</span>
                   </div>
                 </div>
               )}

               {activeRoom.room_types && (
                 <>
                   <h4 className="font-semibold mt-6 mb-3">Vybavení</h4>
                   <div className="grid grid-cols-2 gap-4">
                     {activeRoom.room_types.amenities?.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-dark-gray" />
                          </div>
                          <span>{amenity}</span>
                        </div>
                     ))}
                   </div>
                 </>
               )}

               <div className="flex items-center gap-3 my-8">
                 <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                   <div className="h-2 w-2 rounded-full bg-dark-gray" />
                 </div>
                 <span className="font-medium">Snídaně: 100,- Kč/den/osoba</span>
               </div>

               <div className="mt-8">
                 <div className="mb-4">
                   <span className="text-2xl font-bold">{activeRoom.room_types?.base_price?.toLocaleString('cs-CZ') || 'N/A'} Kč</span>
                   <span className="text-sm text-gray-500"> / noc</span>
                 </div>
                 <div className="flex gap-4">
                   <Button 
                     asChild
                     variant="outline"
                     className="rounded-full px-6 py-3 uppercase tracking-widest text-sm"
                   >
                     <Link href={`/pokoje/${activeRoom.id}`}>
                       <Eye className="mr-2 h-4 w-4" />
                       Detail pokoje
                     </Link>
                   </Button>
                   <Button 
                     className="rounded-full bg-dark-gray text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-black transition-colors"
                     onClick={() => {
                       setSelectedRoomForBooking(activeRoom)
                       setShowBookingForm(true)
                     }}
                   >
                     Rezervovat
                   </Button>
                 </div>
               </div>
             </div>

             <div className="relative h-[400px] md:h-full rounded-lg overflow-hidden">
               <div className="w-full h-full">
                  <Image
                    src={roomImages[currentImage % roomImages.length] || '/images/rooms/placeholder.jpg'}
                    alt={`Pokoj ${activeRoom.room_number}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-opacity duration-500"
                  />
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
               
               {roomImages.length > 1 && (
                <div className="absolute bottom-6 right-6 flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Předchozí</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                    <span className="sr-only">Následující</span>
                  </Button>
                </div>
              )}
             </div>
           </div>
         )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedRoomForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowBookingForm(false)
                setSelectedRoomForBooking(null)
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-serif mb-4">Rezervace {selectedRoomForBooking.room_number}</h2>
              {/* BookingForm component would go here */}
              <p>Pro rezervaci tohoto pokoje přejděte do sekce Rezervace.</p>
              <Button 
                asChild
                className="mt-4 rounded-full bg-dark-gray text-white px-8 py-6 uppercase tracking-widest text-sm hover:bg-black transition-colors"
              >
                <Link href="/rezervace">
                  Přejít na rezervace
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
