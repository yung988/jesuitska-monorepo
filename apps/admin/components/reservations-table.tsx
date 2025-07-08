"use client"

import * as React from "react"
import { Calendar, Check, Clock, User, Bed } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface Reservation {
  id: number
  check_in_date: string
  check_out_date: string
  status: string
  created_at: string
  guests?: {
    first_name: string
    last_name: string
  }
  rooms?: {
    room_number: string
  }
}

const statusMap = {
  confirmed: { label: "Potvrzeno", variant: "default" as const, icon: Check },
  checked_in: { label: "Ubytován", variant: "secondary" as const, icon: User },
  checked_out: { label: "Odjel", variant: "outline" as const, icon: Clock },
  cancelled: { label: "Zrušeno", variant: "destructive" as const, icon: Clock },
}

export function ReservationsTable({ data }: { data: Reservation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nedávné rezervace</CardTitle>
        <CardDescription>
          Přehled posledních rezervací v penzionu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Host</TableHead>
              <TableHead>Pokoj</TableHead>
              <TableHead>Příjezd</TableHead>
              <TableHead>Odjezd</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((reservation) => {
              const status = statusMap[reservation.status as keyof typeof statusMap] || {
                label: reservation.status,
                variant: "outline" as const,
                icon: Clock,
              }
              const StatusIcon = status.icon

              return (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {reservation.guests?.first_name} {reservation.guests?.last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      {reservation.rooms?.room_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(reservation.check_in_date).toLocaleDateString("cs-CZ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(reservation.check_out_date).toLocaleDateString("cs-CZ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/admin/reservations/${reservation.id}`}
                    >
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
