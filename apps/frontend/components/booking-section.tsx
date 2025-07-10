'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Users, Wifi, Coffee, Maximize, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { getRooms, getAvailableRooms } from '@/lib/services/rooms'
import { createBooking, CreateBookingData } from '@/lib/services/bookings'
import { createGuest } from '@/lib/services/guests'
import { getRoomMainImage } from '@/lib/room-images'

// Define room type based on the API response
interface Room {
  id: string;
  room_number: string;
  status: string;
  floor: number;
  room_types?: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    max_occupancy: number;
    amenities?: string[];
  };
}

export default function BookingSection() {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState<string>('2')
  const [showResults, setShowResults] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const { toast } = useToast()

  // Formulářová data pro rezervaci
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  // Fetch all rooms on component mount
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: "Chyba při načítání pokojů",
          description: "Nepodařilo se načíst pokoje, zkuste to prosím později.",
          variant: "destructive"
        });
      }
    };

    fetchAllRooms();
  }, []);

  const handleSearch = async () => {
    if (checkIn && checkOut) {
      setIsLoading(true);
      try {
        // Format dates to ISO string (YYYY-MM-DD)
        const checkInStr = checkIn.toISOString().split('T')[0];
        const checkOutStr = checkOut.toISOString().split('T')[0];
        
        // Fetch available rooms for the selected dates
        const available = await getAvailableRooms(checkInStr, checkOutStr);
        console.log('Available rooms from API:', available);
        console.log('Check-in:', checkInStr, 'Check-out:', checkOutStr);
        setAvailableRooms(available);
        setShowResults(true);
      } catch (error) {
        console.error('Error fetching available rooms:', error);
        
        // Fallback: show all rooms if availability check fails
        console.log('Falling back to all rooms...');
        try {
          const allRooms = await getRooms();
          console.log('All rooms fallback:', allRooms);
          setAvailableRooms(allRooms);
          setShowResults(true);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          toast({
            title: "Chyba při hledání dostupných pokojů",
            description: "Nepodařilo se ověřit dostupnost, zkuste to prosím později.",
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  }

  const calculateTotalPrice = (room: Room) => {
    if (!checkIn || !checkOut || !room.room_types) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * room.room_types.base_price;
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoom || !checkIn || !checkOut) return;

    setIsLoading(true);

    try {
      // 1. Create guest
      const guestData = {
        first_name: bookingData.name.split(' ')[0],
        last_name: bookingData.name.split(' ').slice(1).join(' ') || '',
        email: bookingData.email,
        phone: bookingData.phone
      };
      
      const guest = await createGuest(guestData);
      
      // 2. Create booking
      const bookingPayload: CreateBookingData = {
        guest_id: guest.id,
        room_id: selectedRoom.id,
        check_in_date: checkIn.toISOString().split('T')[0],
        check_out_date: checkOut.toISOString().split('T')[0],
        adults: parseInt(guests),
        children: 0,
        total_amount: calculateTotalPrice(selectedRoom),
        status: 'pending',
        notes: bookingData.message
      };
      
      await createBooking(bookingPayload);
      
      toast({
        title: "Rezervace úspěšně vytvořena!",
        description: "Potvrzení vám zašleme na email.",
      });
      
      // Reset formuláře
      setSelectedRoom(null);
      setBookingData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setShowResults(false);
      setCheckIn(undefined);
      setCheckOut(undefined);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Chyba při vytváření rezervace",
        description: "Nepodařilo se vytvořit rezervaci, zkuste to prosím později.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="booking" className="py-24 md:py-32 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-wider uppercase text-center mb-4">
          Rezervace
        </h2>
        <div className="w-24 h-px bg-dark-gray/30 mx-auto mb-12" />

        {/* Vyhledávací formulář */}
        <Card className="max-w-5xl mx-auto shadow-xl mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Zkontrolovat dostupnost</CardTitle>
            <CardDescription>Vyberte termín vašeho pobytu</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Check-in Date */}
              <div className="space-y-2">
                <Label htmlFor="check-in">Příjezd</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="check-in"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkIn && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'dd. MM. yyyy', { locale: cs }) : "Vyberte datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) =>
                        date < new Date() || (checkOut ? date >= checkOut : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <Label htmlFor="check-out">Odjezd</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="check-out"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkOut && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'dd. MM. yyyy', { locale: cs }) : "Vyberte datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) =>
                        date < new Date() || (checkIn ? date <= checkIn : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Number of Guests */}
              <div className="space-y-2">
                <Label htmlFor="guests">Počet hostů</Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger id="guests">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'host' : num < 5 ? 'hosté' : 'hostů'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={!checkIn || !checkOut || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Hledám...' : 'Vyhledat pokoje'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Výsledky vyhledávání */}
        {showResults && (
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-serif mb-6">Dostupné pokoje</h3>
            <div className="mb-4 text-sm text-gray-600 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Debugovací informace:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Celkem nalezeno: {availableRooms.length} pokojů</li>
                <li>Hledá se pro: {guests} hostů</li>
                <li>Termín: {checkIn?.toLocaleDateString()} - {checkOut?.toLocaleDateString()}</li>
                <li>Filtrovány pokoje s kapacitou menší než {guests}</li>
              </ul>
            </div>
            <div className="space-y-4">
              {/* Pokoje vyřazené filtrem kapacity */}
              {availableRooms.filter(room => {
                const maxOccupancy = room.room_types?.max_occupancy || 2;
                return maxOccupancy < parseInt(guests);
              }).length > 0 && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded">
                  <h4 className="font-semibold mb-2">Vyřazené pokoje (nedostatečná kapacita):</h4>
                  <ul className="list-disc pl-5">
                    {availableRooms.filter(room => {
                      const maxOccupancy = room.room_types?.max_occupancy || 2;
                      return maxOccupancy < parseInt(guests);
                    }).map(room => (
                      <li key={room.id}>
                        Pokoj {room.room_number} - kapacita: {room.room_types?.max_occupancy || 2} osob 
                        (potřebujete: {guests} osob)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dostupné pokoje */}
              {availableRooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Žádné pokoje nebyly nalezeny pro vybrané datum.</p>
                </div>
              ) : (
                availableRooms
                  .filter(room => {
                    const maxOccupancy = room.room_types?.max_occupancy || 2; // Default to 2 if not set
                    console.log(`Room ${room.room_number}: max_occupancy=${maxOccupancy}, guests=${guests}, passes=${maxOccupancy >= parseInt(guests)}`);
                    return maxOccupancy >= parseInt(guests);
                  })
                  .map((room) => (
                  <Card key={room.id} className="overflow-hidden">
                    <div className="grid md:grid-cols-4 gap-6 p-6">
                      <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
                        <Image
                          src={getRoomMainImage(room.room_number)}
                          alt={room.room_number}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-semibold">{room.room_number}</h4>
                            <Badge variant={room.status === 'available' ? "default" : "secondary"}>
                              {room.status === 'available' ? "Dostupný" : "Obsazený"}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{room.room_types?.description || 'Bez popisu'}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Max. {room.room_types?.max_occupancy || 0} {room.room_types?.max_occupancy === 1 ? 'osoba' : (room.room_types?.max_occupancy || 0) < 5 ? 'osoby' : 'osob'}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {room.room_types?.amenities?.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {room.room_types?.amenities && room.room_types.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.room_types.amenities.length - 3} další
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{(room.room_types?.base_price || 0).toLocaleString('cs-CZ')} Kč</p>
                          <p className="text-sm text-gray-600">za noc</p>
                          {checkIn && checkOut && (
                            <>
                              <Separator className="my-2" />
                              <p className="text-lg font-semibold">
                                Celkem: {calculateTotalPrice(room).toLocaleString('cs-CZ')} Kč
                              </p>
                              <p className="text-xs text-gray-600">
                                za {calculateNights()} {calculateNights() === 1 ? 'noc' : calculateNights() < 5 ? 'noci' : 'nocí'}
                              </p>
                            </>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => setSelectedRoom(room)}
                          disabled={room.status !== 'available'}
                          className="mt-4"
                        >
                          {room.status === 'available' ? 'Rezervovat' : 'Obsazeno'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Rezervační formulář */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-serif">Dokončit rezervaci</h3>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-6">
                {/* Souhrn rezervace */}
                <Card>
                  <CardHeader>
                    <CardTitle>Souhrn rezervace</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Pokoj:</span>
                      <span className="font-semibold">{selectedRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Příjezd:</span>
                      <span>{checkIn && format(checkIn, 'dd. MM. yyyy', { locale: cs })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Odjezd:</span>
                      <span>{checkOut && format(checkOut, 'dd. MM. yyyy', { locale: cs })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Počet nocí:</span>
                      <span>{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Počet hostů:</span>
                      <span>{guests}</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Celková cena:</span>
                      <span>{calculateTotalPrice(selectedRoom).toLocaleString('cs-CZ')} Kč</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Kontaktní údaje */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Kontaktní údaje</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Jméno a příjmení *</Label>
                      <Input
                        id="name"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Poznámka (nepovinné)</Label>
                    <Textarea
                      id="message"
                      rows={3}
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                    />
                  </div>
                </div>

                {/* Tlačítka */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedRoom(null)}
                    className="flex-1"
                  >
                    Zrušit
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Odesílám...' : 'Potvrdit rezervaci'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
