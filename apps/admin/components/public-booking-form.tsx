"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Users } from "lucide-react"

interface RoomType {
  id: string
  name: string
  description: string
  capacity: number
  price_per_night: number
  amenities: string[]
  available: boolean
  availableRooms: number
}

export function PublicBookingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [searchData, setSearchData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  })

  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([])
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  const [breakfastIncluded, setBreakfastIncluded] = useState(false)

  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "Česká republika",
  })

  const [specialRequests, setSpecialRequests] = useState("")
  const [priceCalculation, setPriceCalculation] = useState<any>(null)

  const searchAvailability = async () => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        adults: searchData.adults.toString(),
        children: searchData.children.toString(),
      })

      const response = await fetch(`/api/availability?${params}`)
      const data = await response.json()

      if (data.success) {
        setAvailableRooms(data.availability)
        setStep(2)
      } else {
        setError(data.error || "Nepodařilo se zkontrolovat dostupnost")
      }
    } catch (err) {
      setError("Chyba při kontrole dostupnosti")
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = async (roomType: RoomType) => {
    try {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomTypeId: roomType.id,
          checkInDate: searchData.checkIn,
          checkOutDate: searchData.checkOut,
          adults: searchData.adults,
          children: searchData.children,
          breakfastIncluded,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPriceCalculation(data.calculation)
      }
    } catch (err) {
      console.error("Price calculation error:", err)
    }
  }

  const selectRoom = (room: RoomType) => {
    setSelectedRoom(room)
    calculatePrice(room)
    setStep(3)
  }

  const submitBooking = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestInfo,
          roomTypeId: selectedRoom?.id,
          checkInDate: searchData.checkIn,
          checkOutDate: searchData.checkOut,
          adults: searchData.adults,
          children: searchData.children,
          specialRequests,
          breakfastIncluded,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Rezervace byla úspěšně vytvořena! Číslo faktury: ${data.invoiceNumber}`)
        setStep(4)
      } else {
        setError(data.error || "Nepodařilo se vytvořit rezervaci")
      }
    } catch (err) {
      setError("Chyba při vytváření rezervace")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rezervace - Pension Jesuitská
          </CardTitle>
          <CardDescription>Historický penzion v centru Znojma • Hodnocení 8,8/10</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Krok 1: Vyhledávání */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vyberte termín a počet hostů</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Příjezd</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="checkOut">Odjezd</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                    min={searchData.checkIn}
                  />
                </div>

                <div>
                  <Label htmlFor="adults">Dospělí</Label>
                  <Select
                    value={searchData.adults.toString()}
                    onValueChange={(value) => setSearchData({ ...searchData, adults: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="children">Děti</Label>
                  <Select
                    value={searchData.children.toString()}
                    onValueChange={(value) => setSearchData({ ...searchData, children: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={searchAvailability} disabled={loading || !searchData.checkIn || !searchData.checkOut}>
                {loading ? "Kontroluji dostupnost..." : "Zkontrolovat dostupnost"}
              </Button>
            </div>
          )}

          {/* Krok 2: Výběr pokoje */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Dostupné pokoje</h3>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Změnit termín
                </Button>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {searchData.checkIn} - {searchData.checkOut} • {searchData.adults} dospělí
                {searchData.children > 0 && `, ${searchData.children} děti`}
              </div>

              {availableRooms.length === 0 ? (
                <p>Pro vybrané datum nejsou dostupné žádné pokoje.</p>
              ) : (
                <div className="grid gap-4">
                  {availableRooms.map((room) => (
                    <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{room.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {room.capacity} osob
                              </span>
                              <span>{room.availableRooms} dostupných</span>
                            </div>
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {room.amenities.slice(0, 4).map((amenity, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">{room.price_per_night} Kč</div>
                            <div className="text-sm text-gray-500">za noc</div>
                            <Button className="mt-2" onClick={() => selectRoom(room)}>
                              Vybrat
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Krok 3: Údaje hosta */}
          {step === 3 && selectedRoom && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Údaje hosta</h3>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Změnit pokoj
                </Button>
              </div>

              {/* Souhrn rezervace */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Souhrn rezervace</h4>
                  <div className="text-sm space-y-1">
                    <div>{selectedRoom.name}</div>
                    <div>
                      {searchData.checkIn} - {searchData.checkOut}
                    </div>
                    <div>
                      {searchData.adults} dospělí{searchData.children > 0 && `, ${searchData.children} děti`}
                    </div>
                    {priceCalculation && (
                      <div className="font-semibold text-lg mt-2">
                        Celkem: {priceCalculation.totalAmount.toFixed(2)} Kč
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Jméno *</Label>
                  <Input
                    id="firstName"
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Příjmení *</Label>
                  <Input
                    id="lastName"
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="nationality">Národnost</Label>
                  <Input
                    id="nationality"
                    value={guestInfo.nationality}
                    onChange={(e) => setGuestInfo({ ...guestInfo, nationality: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="breakfast"
                  checked={breakfastIncluded}
                  onCheckedChange={(checked) => {
                    setBreakfastIncluded(checked as boolean)
                    if (selectedRoom) calculatePrice(selectedRoom)
                  }}
                />
                <Label htmlFor="breakfast">Snídaně (8 Kč/osoba/den)</Label>
              </div>

              <div>
                <Label htmlFor="requests">Speciální požadavky</Label>
                <Textarea
                  id="requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Například: pozdní příjezd, bezbariérový přístup..."
                />
              </div>

              <Button
                onClick={submitBooking}
                disabled={loading || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email}
                className="w-full"
              >
                {loading ? "Vytvářím rezervaci..." : "Potvrdit rezervaci"}
              </Button>
            </div>
          )}

          {/* Krok 4: Potvrzení */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-xl font-semibold">✓ Rezervace byla úspěšně vytvořena!</div>
              <p>Potvrzení rezervace bylo odesláno na váš email.</p>
              <p className="text-sm text-gray-600">
                V případě dotazů nás kontaktujte na +420 603 830 130 nebo info@jesuitska.cz
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
