"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupAdminPage() {
  const [formData, setFormData] = useState({
    email: "admin@jesuitska.cz",
    password: "admin123",
    fullName: "Jana Sabáčková",
  })
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const createAdmin = async () => {
    setIsLoading(true)
    setResult("")

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setResult(`✅ Administrátor byl úspěšně vytvořen!\nEmail: ${formData.email}\nHeslo: ${formData.password}`)
      } else {
        setResult(`❌ Chyba: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Chyba: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nastavení administrátora</CardTitle>
          <CardDescription>Vytvořte prvního administrátora pro systém</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="fullName">Celé jméno</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <Button onClick={createAdmin} disabled={isLoading} className="w-full">
            {isLoading ? "Vytvářím..." : "Vytvořit administrátora"}
          </Button>

          {result && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
