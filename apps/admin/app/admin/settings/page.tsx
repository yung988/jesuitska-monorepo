import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Building, Mail, Phone, Globe, Clock, CreditCard, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Nastavení</h1>
        <p className="text-muted-foreground">Správa nastavení penzionu a systému</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Obecné</TabsTrigger>
          <TabsTrigger value="notifications">Notifikace</TabsTrigger>
          <TabsTrigger value="payments">Platby</TabsTrigger>
          <TabsTrigger value="security">Zabezpečení</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informace o penzionu</CardTitle>
              <CardDescription>Základní údaje o vašem penzionu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pension-name">Název penzionu</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Input id="pension-name" defaultValue="Penzion Jesuitská" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pension-email">Kontaktní email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input id="pension-email" type="email" defaultValue="info@jesuitska.cz" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pension-phone">Telefon</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input id="pension-phone" defaultValue="+420 123 456 789" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pension-web">Webové stránky</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input id="pension-web" defaultValue="www.jesuitska.cz" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pension-address">Adresa</Label>
                <Textarea 
                  id="pension-address" 
                  defaultValue="Jesuitská 12&#10;602 00 Brno&#10;Česká republika"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check-in">Check-in čas</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input id="check-in" type="time" defaultValue="14:00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-out">Check-out čas</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input id="check-out" type="time" defaultValue="10:00" />
                  </div>
                </div>
              </div>
              <Button>Uložit změny</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fakturační údaje</CardTitle>
              <CardDescription>Údaje pro vystavování faktur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Název společnosti</Label>
                  <Input id="company-name" defaultValue="Penzion Jesuitská s.r.o." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-ico">IČO</Label>
                  <Input id="company-ico" defaultValue="12345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-dic">DIČ</Label>
                  <Input id="company-dic" defaultValue="CZ12345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-account">Číslo účtu</Label>
                  <Input id="bank-account" defaultValue="123456789/0100" />
                </div>
              </div>
              <Button>Uložit změny</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emailové notifikace</CardTitle>
              <CardDescription>Nastavení emailových upozornění</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nové rezervace</Label>
                  <p className="text-sm text-muted-foreground">
                    Upozornění při vytvoření nové rezervace
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Zrušení rezervace</Label>
                  <p className="text-sm text-muted-foreground">
                    Upozornění při zrušení rezervace hostem
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Check-in připomínky</Label>
                  <p className="text-sm text-muted-foreground">
                    Denní přehled očekávaných příjezdů
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Platební upomínky</Label>
                  <p className="text-sm text-muted-foreground">
                    Upozornění na nezaplacené faktury
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS notifikace</CardTitle>
              <CardDescription>Nastavení SMS upozornění</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Urgentní rezervace</Label>
                  <p className="text-sm text-muted-foreground">
                    SMS při rezervaci na dnešní den
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Technické problémy</Label>
                  <p className="text-sm text-muted-foreground">
                    Upozornění na problémy v pokojích
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platební metody</CardTitle>
              <CardDescription>Povolené způsoby platby</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div className="space-y-0.5">
                    <Label>Platba kartou</Label>
                    <p className="text-sm text-muted-foreground">
                      Přijímat platební karty
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div className="space-y-0.5">
                    <Label>Hotovost</Label>
                    <p className="text-sm text-muted-foreground">
                      Přijímat platby v hotovosti
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div className="space-y-0.5">
                    <Label>Bankovní převod</Label>
                    <p className="text-sm text-muted-foreground">
                      Umožnit platby převodem
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storno podmínky</CardTitle>
              <CardDescription>Nastavení storno poplatků</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Bezplatné storno do (dní před příjezdem)</Label>
                  <Input type="number" defaultValue="7" />
                </div>
                <div className="grid gap-2">
                  <Label>Storno poplatek 50% (dní před příjezdem)</Label>
                  <Input type="number" defaultValue="3" />
                </div>
                <div className="grid gap-2">
                  <Label>Storno poplatek 100% (dní před příjezdem)</Label>
                  <Input type="number" defaultValue="1" />
                </div>
              </div>
              <Button>Uložit změny</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Přístupová práva</CardTitle>
              <CardDescription>Správa uživatelů a jejich oprávnění</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Jan Novák</h4>
                      <p className="text-sm text-muted-foreground">jan.novak@jesuitska.cz</p>
                    </div>
                    <Badge>Admin</Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marie Svobodová</h4>
                      <p className="text-sm text-muted-foreground">marie.svobodova@jesuitska.cz</p>
                    </div>
                    <Badge variant="secondary">Recepce</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  + Přidat uživatele
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zabezpečení</CardTitle>
              <CardDescription>Nastavení zabezpečení systému</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dvoufaktorové ověření</Label>
                  <p className="text-sm text-muted-foreground">
                    Vyžadovat 2FA pro přihlášení
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatické odhlášení</Label>
                  <p className="text-sm text-muted-foreground">
                    Odhlásit po 30 minutách nečinnosti
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP whitelist</Label>
                  <p className="text-sm text-muted-foreground">
                    Omezit přístup pouze z povolených IP adres
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Add missing imports
import { Badge } from "@/components/ui/badge"
