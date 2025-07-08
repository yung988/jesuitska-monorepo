import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase"
import { TrendingUp, TrendingDown, Calendar, Users, Bed, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getDashboardStats() {
  const supabase = createServerClient()

  const { count: totalReservations } = await supabase.from("reservations").select("*", { count: "exact", head: true })
  const { count: activeReservations } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("status", "checked_in")
  const { count: totalGuests } = await supabase.from("guests").select("*", { count: "exact", head: true })
  const { count: availableRooms } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  const today = new Date().toISOString().split("T")[0]
  const { count: todayCheckIns } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("check_in_date", today)
    .eq("status", "confirmed")

  const { count: todayCheckOuts } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("check_out_date", today)
    .eq("status", "checked_in")

  // Get recent reservations
  const { data: recentReservations } = await supabase
    .from("reservations")
    .select(`
      *,
      guests (first_name, last_name),
      rooms (room_number)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    totalReservations: totalReservations || 0,
    activeReservations: activeReservations || 0,
    totalGuests: totalGuests || 0,
    availableRooms: availableRooms || 0,
    todayCheckIns: todayCheckIns || 0,
    todayCheckOuts: todayCheckOuts || 0,
    recentReservations: recentReservations || [],
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const occupancyRate =
    Math.round((stats.activeReservations / (stats.activeReservations + stats.availableRooms)) * 100) || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Přehled penzionu Jesuitská</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Celkem rezervací</p>
                <p className="text-3xl font-bold">{stats.totalReservations.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+10%</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Check In</p>
                <p className="text-3xl font-bold">{stats.todayCheckIns.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+16%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Check Out</p>
                <p className="text-3xl font-bold">{stats.todayCheckOuts.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">-15%</span>
                </div>
              </div>
              <Bed className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Obsazenost</p>
                <p className="text-3xl font-bold">{occupancyRate}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+5%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Obsazenost</CardTitle>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Dostupné</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Obsazené</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span>Nepřipravené</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  ></div>
                  <div className="w-full bg-blue-500" style={{ height: `${Math.random() * 60 + 10}%` }}></div>
                  <div className="w-full bg-gray-300 rounded-b" style={{ height: `${Math.random() * 30 + 5}%` }}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Arrivals */}
        <Card>
          <CardHeader>
            <CardTitle>Nedávné příjezdy</CardTitle>
            <CardDescription>Posledních 5 rezervací</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentReservations.map((reservation: any, index) => (
                <div key={reservation.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">#{String(index + 1).padStart(3, "0")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reservation.guests?.first_name} {reservation.guests?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pokoj {reservation.rooms?.room_number} •{" "}
                      {new Date(reservation.created_at).toLocaleDateString("cs-CZ")}
                    </p>
                  </div>
                  <Badge variant={reservation.status === "confirmed" ? "default" : "secondary"}>
                    {reservation.status === "confirmed" ? "Potvrzeno" : reservation.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Přehled tržeb</CardTitle>
            <CardDescription>Celkové tržby za posledních 30 dní</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-4">
              {(stats.totalReservations * 2500).toLocaleString()} Kč
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Booking.com</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Přímé rezervace</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ostatní</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                  <span className="text-sm font-medium">40%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rychlé akce</CardTitle>
            <CardDescription>Nejčastější úkoly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/reservations/new"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Nová rezervace</div>
                  <div className="text-sm text-blue-600">Vytvořit novou rezervaci</div>
                </div>
              </div>
            </a>

            <a
              href="/admin/rooms"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <div className="flex items-center space-x-3">
                <Bed className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Správa pokojů</div>
                  <div className="text-sm text-green-600">Zobrazit stav pokojů</div>
                </div>
              </div>
            </a>

            <a
              href="/admin/invoices"
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">Faktury</div>
                  <div className="text-sm text-purple-600">Správa faktur a plateb</div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
