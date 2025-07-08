import { createServerClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getPayments() {
  const supabase = createServerClient()
  
  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      *,
      invoices (
        invoice_number,
        reservations (
          guests (first_name, last_name)
        )
      )
    `)
    .order("payment_date", { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
    return []
  }

  return payments || []
}

function getPaymentMethodBadge(method: string) {
  const methodConfig = {
    cash: { label: "Hotovost", variant: "default" as const },
    card: { label: "Karta", variant: "secondary" as const },
    transfer: { label: "Převod", variant: "outline" as const },
  }

  const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.cash
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { label: "Čeká", variant: "outline" as const, icon: Clock },
    completed: { label: "Dokončeno", variant: "default" as const, icon: CheckCircle2 },
    failed: { label: "Selhalo", variant: "destructive" as const, icon: AlertCircle },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export default async function PaymentsPage() {
  const payments = await getPayments()
  
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const completedPayments = payments.filter(p => p.status === "completed")
  const pendingPayments = payments.filter(p => p.status === "pending")
  
  // Calculate today's payments
  const today = new Date().toISOString().split("T")[0]
  const todayPayments = payments.filter(p => 
    p.payment_date && p.payment_date.startsWith(today)
  )
  const todayTotal = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platby</h1>
          <p className="text-muted-foreground">Přehled všech plateb a transakcí</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkové platby</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments.toLocaleString("cs-CZ")} Kč</div>
            <p className="text-xs text-muted-foreground">za všechny období</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dnešní platby</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTotal.toLocaleString("cs-CZ")} Kč</div>
            <p className="text-xs text-muted-foreground">{todayPayments.length} transakcí</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokončené</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments.length}</div>
            <p className="text-xs text-muted-foreground">plateb</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čekající</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">plateb</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Distribution */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Hotovost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments
                .filter(p => p.payment_method === "cash")
                .reduce((sum, p) => sum + (p.amount || 0), 0)
                .toLocaleString("cs-CZ")} Kč
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Platební karta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments
                .filter(p => p.payment_method === "card")
                .reduce((sum, p) => sum + (p.amount || 0), 0)
                .toLocaleString("cs-CZ")} Kč
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Bankovní převod</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments
                .filter(p => p.payment_method === "transfer")
                .reduce((sum, p) => sum + (p.amount || 0), 0)
                .toLocaleString("cs-CZ")} Kč
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Všechny platby</TabsTrigger>
          <TabsTrigger value="today">Dnešní</TabsTrigger>
          <TabsTrigger value="pending">Čekající</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historie plateb</CardTitle>
              <CardDescription>Všechny zaznamenané platby</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Faktura</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Částka</TableHead>
                    <TableHead>Způsob platby</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Poznámka</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString("cs-CZ")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.invoices?.invoice_number || "-"}
                      </TableCell>
                      <TableCell>
                        {payment.invoices?.reservations?.guests?.first_name} {payment.invoices?.reservations?.guests?.last_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.amount?.toLocaleString("cs-CZ")} Kč
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(payment.payment_method)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dnešní platby</CardTitle>
              <CardDescription>Platby přijaté dnes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Čas</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Částka</TableHead>
                    <TableHead>Způsob platby</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleTimeString("cs-CZ", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                      <TableCell>
                        {payment.invoices?.reservations?.guests?.first_name} {payment.invoices?.reservations?.guests?.last_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.amount?.toLocaleString("cs-CZ")} Kč
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(payment.payment_method)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Čekající platby</CardTitle>
              <CardDescription>Platby čekající na zpracování</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Částka</TableHead>
                    <TableHead>Způsob platby</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString("cs-CZ")}
                      </TableCell>
                      <TableCell>
                        {payment.invoices?.reservations?.guests?.first_name} {payment.invoices?.reservations?.guests?.last_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.amount?.toLocaleString("cs-CZ")} Kč
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(payment.payment_method)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="default">
                          Potvrdit platbu
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
