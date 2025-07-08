import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase"
import { Plus, FileText, Download, Eye, DollarSign } from "lucide-react"
import Link from "next/link"

async function getInvoicesData() {
  const supabase = createServerClient()

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      *,
      reservations (
        guests (first_name, last_name, email),
        rooms (room_number)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }

  return invoices || []
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { label: "Čekající", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
    paid: { label: "Zaplaceno", variant: "default" as const, color: "bg-green-100 text-green-800" },
    overdue: { label: "Po splatnosti", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    cancelled: { label: "Zrušeno", variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  return <Badge className={config.color}>{config.label}</Badge>
}

export default async function InvoicesPage() {
  const invoices = await getInvoicesData()

  const invoiceStats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faktury</h1>
          <p className="text-gray-600">Správa faktur a plateb</p>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nová faktura
          </Button>
        </Link>
      </div>

      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celkem faktur</p>
                <p className="text-2xl font-bold">{invoiceStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zaplaceno</p>
                <p className="text-2xl font-bold text-green-600">{invoiceStats.paid}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Čekající</p>
                <p className="text-2xl font-bold text-yellow-600">{invoiceStats.pending}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celková částka</p>
                <p className="text-2xl font-bold text-blue-600">{invoiceStats.totalAmount.toLocaleString()} Kč</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Seznam faktur</CardTitle>
          <CardDescription>Celkem {invoices.length} faktur</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Číslo faktury</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Pokoj</TableHead>
                <TableHead>Datum vystavení</TableHead>
                <TableHead>Splatnost</TableHead>
                <TableHead>Částka</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {invoice.reservations?.guests?.first_name} {invoice.reservations?.guests?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{invoice.reservations?.guests?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.reservations?.rooms?.room_number}</TableCell>
                  <TableCell>{new Date(invoice.issue_date).toLocaleDateString("cs-CZ")}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString("cs-CZ")}</TableCell>
                  <TableCell className="font-medium">{invoice.total_amount.toLocaleString()} Kč</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
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
