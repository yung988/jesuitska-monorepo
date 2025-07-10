"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { Calendar, Users, Phone, Mail, Loader2, ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getRoom } from "@/lib/services/rooms"
import { createBooking } from "@/lib/services/bookings"
import { createGuest } from "@/lib/services/guests"
import { useToast } from "@/components/ui/use-toast"
import PaymentMockup from "@/components/payment-mockup"

// Interface for room data from Supabase
interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  is_clean: boolean;
  room_types?: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    max_occupancy: number;
    amenities?: string[];
  };
}

export default function RoomBookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const roomId = params.id as string
  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")
  const guests = searchParams.get("guests")
  
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details')
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    message: "",
    winecellar: false,
  })

  // Calculate nights
  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  useEffect(() => {
    async function fetchRoom() {
      try {
        const roomData = await getRoom(roomId)
        setRoom(roomData)
      } catch (error) {
        console.error("Error fetching room:", error)
        toast({
          title: "Chyba",
          description: "Nepodařilo se načíst informace o pokoji",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [roomId, toast])

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkIn || !checkOut || !room) {
      toast({
        title: "Chyba",
        description: "Chybí údaje o termínu rezervace",
        variant: "destructive",
      })
      return
    }
    
    // Proceed to payment step
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = async () => {
    setSubmitting(true)

    try {
      // 1. Create guest
      const guestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone
      }
      
      const guest = await createGuest(guestData)
      
      // 2. Create booking
      const bookingData = {
        guest_id: guest.id,
        room_id: roomId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults: Number(guests) || 1,
        children: 0,
        total_amount: room.room_types?.base_price ? room.room_types.base_price * nights : 0,
        status: 'confirmed' as 'confirmed',
        notes: formData.message
      }
      
      await createBooking(bookingData)

      toast({
        title: "Rezervace potvrzena",
        description: "Vaše rezervace byla úspěšně vytvořena a zaplacena.",
      })

      // Show confirmation step
      setCurrentStep('confirmation')
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se vytvořit rezervaci. Zkuste to prosím znovu.",
        variant: "destructive",
      })
      setCurrentStep('details')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentCancel = () => {
    setCurrentStep('details')
  }

  const handleConfirmationClose = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítám...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Pokoj nebyl nalezen</p>
      </div>
    )
  }

  // Calculate total amount
  const totalAmount = room?.room_types?.base_price ? room.room_types.base_price * nights : 0

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Progress indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${currentStep === 'details' ? 'text-blue-600' : currentStep === 'payment' || currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'details' ? 'bg-blue-600 text-white' : currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {currentStep === 'payment' || currentStep === 'confirmation' ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-medium">Údaje</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-blue-600' : currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'payment' ? 'bg-blue-600 text-white' : currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {currentStep === 'confirmation' ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="font-medium">Platba</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${currentStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {currentStep === 'confirmation' ? <CheckCircle className="w-5 h-5" /> : '3'}
              </div>
              <span className="font-medium">Potvrzení</span>
            </div>
          </div>
        </div>

        {currentStep === 'details' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Room details */}
            <div>
              <Card>
                <CardHeader className="p-0">
                  <div className="relative h-64 w-full">
                    <Image
                      src="/images/rooms/pokoj.png"
                      alt={room.room_types?.name || room.room_number}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl mb-4">{room.room_types?.name || `Pokoj ${room.room_number}`}</CardTitle>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {checkIn && format(new Date(checkIn), "d. MMMM yyyy", { locale: cs })} - 
                        {" "}{checkOut && format(new Date(checkOut), "d. MMMM yyyy", { locale: cs })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{guests} {Number(guests) === 1 ? "host" : "hosté"}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span>{room.room_types?.base_price || 0} Kč × {nights} {nights === 1 ? "noc" : nights < 5 ? "noci" : "nocí"}</span>
                        <span>{totalAmount} Kč</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Celkem</span>
                        <span>{totalAmount} Kč</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking form */}
            <Card>
              <CardHeader>
                <CardTitle>Kontaktní údaje</CardTitle>
                <CardDescription>
                  Vyplňte prosím kontaktní údaje pro rezervaci
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="first_name">Jméno *</Label>
                    <Input
                      id="first_name"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="last_name">Příjmení *</Label>
                    <Input
                      id="last_name"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Zpráva (nepovinné)</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Speciální požadavky, čas příjezdu, atd."
                    />
                  </div>

                  <div className="border-t pt-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                    >
                      Pokračovat k platbě
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-serif mb-2">Platba za rezervaci</h2>
              <p className="text-gray-600">
                Pokoj: <strong>{room?.room_types?.name || room?.room_number}</strong> | 
                {" "}{nights} {nights === 1 ? "noc" : nights < 5 ? "noci" : "nocí"} | 
                {" "}{guests} {Number(guests) === 1 ? "host" : "hosté"}
              </p>
            </div>
            
            <PaymentMockup
              totalAmount={totalAmount}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-600" />
                <h2 className="text-3xl font-serif mb-4 text-green-800">Rezervace potvrzena!</h2>
                <p className="text-lg mb-6 text-gray-600">
                  Vaše rezervace byla úspěšně vytvořena a zaplacena.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold mb-3">Souhrn rezervace:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pokoj:</span>
                      <span>{room?.room_types?.name || room?.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Datum:</span>
                      <span>
                        {checkIn && format(new Date(checkIn), "d.M.yyyy", { locale: cs })} - 
                        {" "}{checkOut && format(new Date(checkOut), "d.M.yyyy", { locale: cs })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hosté:</span>
                      <span>{guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jméno:</span>
                      <span>{formData.first_name} {formData.last_name}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Celková cena:</span>
                      <span>{totalAmount.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <Badge variant="secondary" className="mb-4">
                    🎭 DEMO REŽIM - Rezervace nebyla skutečně vytvořena
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Potvrzení obdržíte na email <strong>{formData.email}</strong>
                  </p>
                </div>

                <Button onClick={handleConfirmationClose} className="w-full">
                  Zpět na hlavní stránku
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
