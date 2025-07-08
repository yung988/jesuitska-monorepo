import { createServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, TrendingDown, Calendar, Bed } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

async function getRevenueData() {
  const supabase = createServerClient()
  
  // Get payments for revenue calculation
  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      *,
      invoices (
        reservations (
          check_in_date,
          check_out_date,
          rooms (room_number, room_types (name))
        )
      )
    `)
    .eq("status", "completed")
    .order("payment_date", { ascending: true })

  if (error) {
    console.error("Error fetching revenue data:", error)
    return { payments: [], monthlyData: [], roomTypeData: [] }
  }

  // Calculate monthly revenue
  const monthlyRevenue = new Map()
  const roomTypeRevenue = new Map()

  payments?.forEach(payment => {
    const date = new Date(payment.payment_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    const currentMonthRevenue = monthlyRevenue.get(monthKey) || 0
    monthlyRevenue.set(monthKey, currentMonthRevenue + (payment.amount || 0))

    // Room type revenue
    const roomType = payment.invoices?.reservations?.rooms?.room_types?.name || "Ostatní"
    const currentRoomTypeRevenue = roomTypeRevenue.get(roomType) || 0
    roomTypeRevenue.set(roomType, currentRoomTypeRevenue + (payment.amount || 0))
  })

  // Convert to array format for charts
  const monthlyData = Array.from(monthlyRevenue.entries())
    .slice(-12) // Last 12 months
    .map(([month, revenue]) => ({
      month: new Date(month + "-01").toLocaleDateString("cs-CZ", { month: "short", year: "numeric" }),
      revenue
    }))

  const roomTypeData = Array.from(roomTypeRevenue.entries())
    .map(([roomType, revenue]) => ({
      roomType,
      revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)

  return { payments: payments || [], monthlyData, roomTypeData }
}

const chartConfig = {
  revenue: {
    label: "Tržby",
    color: "hsl(var(--chart-1))",
  },
}

export default async function RevenuePage() {
  const { payments, monthlyData, roomTypeData } = await getRevenueData()
  
  // Calculate statistics
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthRevenue = payments
    .filter(p => {
      const date = new Date(p.payment_date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const lastMonthRevenue = payments
    .filter(p => {
      const date = new Date(p.payment_date)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const monthGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tržby</h1>
          <p className="text-muted-foreground">Analýza příjmů a výkonnosti penzionu</p>
        </div>
        <Select defaultValue="12m">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 měsíc</SelectItem>
            <SelectItem value="3m">3 měsíce</SelectItem>
            <SelectItem value="6m">6 měsíců</SelectItem>
            <SelectItem value="12m">12 měsíců</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkové tržby</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString("cs-CZ")} Kč</div>
            <p className="text-xs text-muted-foreground">za všechna období</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tento měsíc</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthRevenue.toLocaleString("cs-CZ")} Kč</div>
            <div className="flex items-center text-xs">
              {Number(monthGrowth) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{monthGrowth}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">{monthGrowth}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">oproti minulému měsíci</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměr na měsíc</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyData.length > 0 
                ? Math.round(totalRevenue / monthlyData.length).toLocaleString("cs-CZ")
                : 0} Kč
            </div>
            <p className="text-xs text-muted-foreground">za posledních 12 měsíců</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nejlepší měsíc</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyData.length > 0
                ? Math.max(...monthlyData.map(d => d.revenue)).toLocaleString("cs-CZ")
                : 0} Kč
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyData.find(d => d.revenue === Math.max(...monthlyData.map(m => m.revenue)))?.month || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vývoj tržeb</CardTitle>
          <CardDescription>Měsíční tržby za posledních 12 měsíců</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => value}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => `${Number(value).toLocaleString("cs-CZ")} Kč`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue by Room Type */}
        <Card>
          <CardHeader>
            <CardTitle>Tržby podle typu pokoje</CardTitle>
            <CardDescription>Rozdělení příjmů podle kategorií pokojů</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={roomTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="roomType" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => `${Number(value).toLocaleString("cs-CZ")} Kč`}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Zdroje rezervací</CardTitle>
            <CardDescription>Rozdělení tržeb podle zdrojů rezervací</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Booking.com</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">65%</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(totalRevenue * 0.65).toLocaleString("cs-CZ")} Kč
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Přímé rezervace</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">25%</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(totalRevenue * 0.25).toLocaleString("cs-CZ")} Kč
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm">Ostatní</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">10%</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(totalRevenue * 0.10).toLocaleString("cs-CZ")} Kč
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
