import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { createServerClient } from "@/lib/supabase"
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

async function getGuests() {
  const supabase = createServerClient()

  const { data: guests, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching guests:", error)
    return []
  }

  return guests || []
}

export default async function GuestsPage() {
  const guests = await getGuests()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hosté</h1>
          <p className="text-gray-600">Správa hostů penzionu</p>
        </div>
        <Link href="/admin/guests/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nový host
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seznam hostů</CardTitle>
          <CardDescription>Celkem {guests.length} registrovaných hostů</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Hledat hosty..." className="pl-8" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jméno</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Národnost</TableHead>
                <TableHead>Registrace</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest: any) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <div className="font-medium">
                      {guest.first_name} {guest.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone || "-"}</TableCell>
                  <TableCell>{guest.nationality || "-"}</TableCell>
                  <TableCell>{new Date(guest.created_at).toLocaleDateString("cs-CZ")}</TableCell>
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
