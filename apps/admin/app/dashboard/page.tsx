import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ReservationsTable } from "@/components/reservations-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createServerClient } from "@/lib/supabase"

async function getRecentReservations() {
  const supabase = createServerClient()
  const { data: recentReservations } = await supabase
    .from("reservations")
    .select(`
      *,
      guests (first_name, last_name),
      rooms (room_number)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  return recentReservations || []
}

export default async function Page() {
  const recentReservations = await getRecentReservations()
  
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="px-4 lg:px-6">
                <ReservationsTable data={recentReservations} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
