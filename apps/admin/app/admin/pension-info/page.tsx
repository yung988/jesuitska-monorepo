import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase"
import { MapPin, Phone, Mail, Globe, Star, Wifi, Car, Coffee } from "lucide-react"

async function getPensionInfo() {
  const supabase = createServerClient()

  const { data: pensionInfo } = await supabase.from("pension_info").select("*").single()

  const { data: services } = await supabase.from("pension_services").select("*").eq("is_active", true)

  const { data: attractions } = await supabase.from("tourist_attractions").select("*").order("distance_km")

  return {
    pensionInfo: pensionInfo || {},
    services: services || [],
    attractions: attractions || [],
  }
}

export default async function PensionInfoPage() {
  const { pensionInfo, services, attractions } = await getPensionInfo()

  const nearbyAttractions = attractions.filter((a: any) => a.is_nearby)
  const distantAttractions = attractions.filter((a: any) => !a.is_nearby)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Informace o penzionu</h1>
        <p className="text-gray-600">Kompletní přehled penzionu Jesuitská</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>Základní informace</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{pensionInfo.name}</h3>
              <p className="text-gray-600">{pensionInfo.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{pensionInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{pensionInfo.phone2}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{pensionInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{pensionInfo.website}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Správce:</strong> {pensionInfo.manager_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>IČ:</strong> {pensionInfo.ic}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Otevřeno od:</strong> {pensionInfo.opened_year}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Hodnocení a provoz</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{pensionInfo.rating}/10</div>
                <div className="text-sm text-gray-600">Celkové hodnocení</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{pensionInfo.location_rating}/10</div>
                <div className="text-sm text-gray-600">Hodnocení polohy</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Check-in:</span>
                <Badge variant="outline">{pensionInfo.check_in_time}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Check-out:</span>
                <Badge variant="outline">{pensionInfo.check_out_time}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Snídaně:</span>
                <Badge variant="outline">{pensionInfo.breakfast_price}€</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Jazyky personálu:</p>
              <div className="flex flex-wrap gap-2">
                {pensionInfo.languages?.map((lang: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Popis penzionu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{pensionInfo.description}</p>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Služby a vybavení</CardTitle>
          <CardDescription>Kompletní přehled dostupných služeb</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service: any) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    {service.category === "Internet" && <Wifi className="h-4 w-4 text-green-600" />}
                    {service.category === "Parkování" && <Car className="h-4 w-4 text-green-600" />}
                    {service.category === "Vybavení" && <Coffee className="h-4 w-4 text-green-600" />}
                    {!["Internet", "Parkování", "Vybavení"].includes(service.category) && (
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{service.service_name}</p>
                    <p className="text-xs text-gray-500">{service.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  {service.is_free ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Zdarma
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{service.price}€</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tourist Attractions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atrakce v okolí</CardTitle>
            <CardDescription>Zajímavá místa v docházkové vzdálenosti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyAttractions.map((attraction: any) => (
                <div key={attraction.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{attraction.name}</p>
                    <p className="text-xs text-gray-500">{attraction.category}</p>
                  </div>
                  <Badge variant="outline">Pěšky</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vzdálenější atrakce</CardTitle>
            <CardDescription>Výlety v širším okolí</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distantAttractions.map((attraction: any) => (
                <div key={attraction.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{attraction.name}</p>
                    <p className="text-xs text-gray-500">{attraction.category}</p>
                  </div>
                  <Badge variant="secondary">{attraction.distance_km} km</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
