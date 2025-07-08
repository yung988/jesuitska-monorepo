import { TrendingDownIcon, TrendingUpIcon, Calendar, Users, Bed, DollarSign } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase"

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

  return {
    totalReservations: totalReservations || 0,
    activeReservations: activeReservations || 0,
    totalGuests: totalGuests || 0,
    availableRooms: availableRooms || 0,
    todayCheckIns: todayCheckIns || 0,
    todayCheckOuts: todayCheckOuts || 0,
  }
}

export async function SectionCards() {
  const stats = await getDashboardStats()
  const occupancyRate = Math.round((stats.activeReservations / (stats.activeReservations + stats.availableRooms)) * 100) || 0
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="relative">
          <CardDescription className="text-blue-100">Celkem rezervací</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {stats.totalReservations.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="size-4" />
            <span>+10% oproti minulému měsíci</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="relative">
          <CardDescription className="text-green-100">Dnešní příjezdy</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {stats.todayCheckIns.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Users className="h-8 w-8 text-green-200" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="size-4" />
            <span>+16% oproti průměru</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="relative">
          <CardDescription className="text-orange-100">Dnešní odjezdy</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {stats.todayCheckOuts.toLocaleString()}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Bed className="h-8 w-8 text-orange-200" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-2">
            <TrendingDownIcon className="size-4" />
            <span>-15% oproti včera</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="relative">
          <CardDescription className="text-purple-100">Obsazenost</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {occupancyRate}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="size-4" />
            <span>+5% oproti minulému týdnu</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
