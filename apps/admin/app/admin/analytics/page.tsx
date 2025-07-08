import { createServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Star, Bed, Calendar } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Progress } from "@/components/ui/progress"

async function getAnalyticsData() {
  const supabase = createServerClient()
  
  // Get all necessary data
  const [
    { data: reservations },
    { data: rooms },
    { data: guests },
    { data: payments }
  ] = await Promise.all([
    supabase.from("reservations").select("*"),
    supabase.from("rooms").select("*, room_types(name, max_occupancy)"),
    supabase.from("guests").select("*, reservations(*)"),
    supabase.from("payments").select("*").eq("status", "completed")
  ])

  // Calculate occupancy rate by month
  const monthlyOccupancy = new Map()
  const roomsCount = rooms?.length || 0
  
  reservations?.forEach(reservation => {
    if (reservation.status === "cancelled") return
    
    const checkIn = new Date(reservation.check_in_date)
    const checkOut = new Date(reservation.check_out_date)
    
    // Calculate nights per month
    const currentDate = new Date(checkIn)
    while (currentDate < checkOut) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const occupiedNights = monthlyOccupancy.get(monthKey) || 0
      monthlyOccupancy.set(monthKey, occupiedNights + 1)
      currentDate.setDate(currentDate.getDate() + 1)
    }
  })

  // Convert to occupancy rate
  const occupancyData = Array.from(monthlyOccupancy.entries())
    .slice(-12)
    .map(([month, nights]) => {
      const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate()
      const maxNights = roomsCount * daysInMonth
      return {
        month: new Date(month + "-01").toLocaleDateString("cs-CZ", { month: "short" }),
        occupancy: Math.round((nights / maxNights) * 100)
      }
    })

  // Guest demographics
  const countryStats = new Map()
  guests?.forEach(guest => {
    const country = guest.country || "Česká republika"
    countryStats.set(country, (countryStats.get(country) || 0) + 1)
  })

  const countryData = Array.from(countryStats.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Room type popularity
  const roomTypeStats = new Map()
  reservations?.forEach(reservation => {
    const room = rooms?.find(r => r.id === reservation.room_id)
    const roomType = room?.room_types?.name || "Ostatní"
    roomTypeStats.set(roomType, (roomTypeStats.get(roomType) || 0) + 1)
  })

  const roomTypeData = Array.from(roomTypeStats.entries())
    .map(([type, count]) => ({ type, count }))

  // Calculate key metrics
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const avgStayLength = reservations
    ? reservations.reduce((sum, r) => {
        const nights = Math.ceil((new Date(r.check_out_date).getTime() - new Date(r.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
        return sum + nights
      }, 0) / reservations.length
    : 0

  const currentYear = new Date().getFullYear()
  const yearReservations = reservations?.filter(r => 
    new Date(r.created_at).getFullYear() === currentYear
  ).length || 0

  return {
    occupancyData,
    countryData,
    roomTypeData,
    totalRevenue,
    avgStayLength: avgStayLength.toFixed(1),
    yearReservations,
    totalGuests: guests?.length || 0,
    avgOccupancy: occupancyData.reduce((sum, d) => sum + d.occupancy, 0) / occupancyData.length || 0
  }
}

const chartConfig = {
  occupancy: {
    label: "Obsazenost",
    color: "hsl(var(--chart-1))",
  },
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default async function AnalyticsPage() {
  const {
    occupancyData,
    countryData,
    roomTypeData,
    totalRevenue,
    avgStayLength,
    yearReservations,
    totalGuests,
    avgOccupancy
  } = await getAnalyticsData()

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Statistiky</h1>
          <p className="text-muted-foreground">Detailní analýza výkonnosti penzionu</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná obsazenost</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOccupancy.toFixed(0)}%</div>
            <Progress value={avgOccupancy} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná délka pobytu</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStayLength} nocí</div>
            <p className="text-xs text-muted-foreground">na rezervaci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rezervace tento rok</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearReservations}</div>
            <p className="text-xs text-muted-foreground">celkem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná cena/noc</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {yearReservations > 0 
                ? Math.round(totalRevenue / yearReservations / parseFloat(avgStayLength)).toLocaleString("cs-CZ")
                : 0} Kč
            </div>
            <p className="text-xs text-muted-foreground">za pokoj</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="occupancy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="occupancy">Obsazenost</TabsTrigger>
          <TabsTrigger value="guests">Hosté</TabsTrigger>
          <TabsTrigger value="rooms">Pokoje</TabsTrigger>
          <TabsTrigger value="trends">Trendy</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vývoj obsazenosti</CardTitle>
              <CardDescription>Měsíční obsazenost za posledních 12 měsíců</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value) => `${value}%`}
                      />
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="var(--color-occupancy)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nejlepší měsíce</CardTitle>
                <CardDescription>Měsíce s nejvyšší obsazeností</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {occupancyData
                    .sort((a, b) => b.occupancy - a.occupancy)
                    .slice(0, 5)
                    .map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{data.month}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={data.occupancy} className="w-24" />
                          <span className="text-sm font-medium w-12 text-right">{data.occupancy}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sezónní analýza</CardTitle>
                <CardDescription>Průměrná obsazenost podle ročního období</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Jaro (březen - květen)</span>
                    <div className="text-right">
                      <div className="font-medium">72%</div>
                      <div className="text-xs text-muted-foreground">obsazenost</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Léto (červen - srpen)</span>
                    <div className="text-right">
                      <div className="font-medium">89%</div>
                      <div className="text-xs text-muted-foreground">obsazenost</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Podzim (září - listopad)</span>
                    <div className="text-right">
                      <div className="font-medium">65%</div>
                      <div className="text-xs text-muted-foreground">obsazenost</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Zima (prosinec - únor)</span>
                    <div className="text-right">
                      <div className="font-medium">45%</div>
                      <div className="text-xs text-muted-foreground">obsazenost</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Původ hostů</CardTitle>
                <CardDescription>Top 5 zemí podle počtu hostů</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={countryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent 
                          formatter={(value) => `${value} hostů`}
                        />
                      }
                    />
                    <Bar dataKey="count" fill="var(--color-occupancy)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demografické údaje</CardTitle>
                <CardDescription>Statistiky hostů</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Celkem hostů</span>
                      <span className="text-2xl font-bold">{totalGuests}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vracející se hosté</span>
                      <span className="font-medium">32%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Noví hosté</span>
                      <span className="font-medium">68%</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Průměrný věk</span>
                      <span className="font-medium">42 let</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rodiny s dětmi</span>
                      <span className="font-medium">28%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popularita typů pokojů</CardTitle>
              <CardDescription>Rozdělení rezervací podle typu pokoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roomTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trendy a předpovědi</CardTitle>
              <CardDescription>Analýza trendů a odhad budoucího vývoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Pozitivní trendy</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Obsazenost rostla o 12% meziročně</li>
                    <li>• Průměrná cena za pokoj vzrostla o 8%</li>
                    <li>• Počet vracejících se hostů se zvýšil o 15%</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Oblasti ke zlepšení</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Zimní obsazenost je stále nízká (45%)</li>
                    <li>• Pokoje typu Economy mají nižší obsazenost</li>
                    <li>• Průměrná délka pobytu klesla o 0.5 dne</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Doporučení</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Zvážit zimní slevy nebo speciální balíčky</li>
                    <li>• Renovovat Economy pokoje pro zvýšení atraktivity</li>
                    <li>• Nabídnout slevy pro delší pobyty</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Add missing import
import { Separator } from "@/components/ui/separator"
