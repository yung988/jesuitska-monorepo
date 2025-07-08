import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

async function getReservations() {
  const supabase = createServerClient()

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(`
      *,
      guests (first_name, last_name, email),
      rooms (room_number, room_types (name))
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reservations:", error)
    return []
  }

  return reservations || []
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { label: "Čekající", variant: "secondary" as const },
    confirmed: { label: "Potvrzeno", variant: "default" as const },
    checked_in: { label: "Ubytován", variant: "default" as const },
    checked_out: { label: "Odjel", variant: "outline" as const },
    cancelled: { label: "Zrušeno", variant: "destructive" as const },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default async function ReservationsPage() {
  const reservations = await getReservations()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rezervace</h1>
          <p className="text-gray-600">Správa rezervací penzionu</p>
        </div>
        <Link href="/admin/reservations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nová rezervace
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seznam rezervací</CardTitle>
          <CardDescription>Celkem {reservations.length} rezervací</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host</TableHead>
                <TableHead>Pokoj</TableHead>
                <TableHead>Příjezd</TableHead>
                <TableHead>Odjezd</TableHead>
                <TableHead>Hosté</TableHead>
                <TableHead>Celkem</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation: any) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {reservation.guests?.first_name} {reservation.guests?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.guests?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.rooms?.room_number}</div>
                      <div className="text-sm text-gray-500">{reservation.rooms?.room_types?.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(reservation.check_in_date).toLocaleDateString("cs-CZ")}</TableCell>
                  <TableCell>{new Date(reservation.check_out_date).toLocaleDateString("cs-CZ")}</TableCell>
                  <TableCell>
                    {reservation.adults}
                    {reservation.children > 0 && ` + ${reservation.children} dětí`}
                  </TableCell>
                  <TableCell>{reservation.total_amount.toLocaleString("cs-CZ")} Kč</TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
