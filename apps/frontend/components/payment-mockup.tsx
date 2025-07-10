'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Lock, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMockupProps {
  totalAmount: number
  onSuccess: () => void
  onCancel: () => void
}

type PaymentStep = 'form' | 'processing' | 'success' | 'error'

export default function PaymentMockup({ totalAmount, onSuccess, onCancel }: PaymentMockupProps) {
  const [step, setStep] = useState<PaymentStep>('form')
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  })

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces
    const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardData({ ...cardData, cardNumber: formatted })
    }
  }

  const handleExpiryChange = (value: string) => {
    // Format expiry date MM/YY
    const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
    if (formatted.length <= 5) {
      setCardData({ ...cardData, expiryDate: formatted })
    }
  }

  const handleCvvChange = (value: string) => {
    const formatted = value.replace(/\D/g, '')
    if (formatted.length <= 3) {
      setCardData({ ...cardData, cvv: formatted })
    }
  }

  const simulatePayment = () => {
    setStep('processing')
    
    // Simulate payment processing
    setTimeout(() => {
      // 80% success rate for demo
      const isSuccess = Math.random() > 0.2
      
      if (isSuccess) {
        setStep('success')
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setStep('error')
      }
    }, 3000)
  }

  const handleRetry = () => {
    setStep('form')
  }

  if (step === 'processing') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Zpracování platby</h3>
          <p className="text-gray-600">Čekejte prosím, zpracováváme vaši platbu...</p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-xs">
              🎭 DEMO REŽIM - Simulace platby
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold mb-2 text-green-800">Platba byla úspěšná!</h3>
          <p className="text-gray-600 mb-4">
            Vaše rezervace byla potvrzena a platba ve výši <strong>{totalAmount.toLocaleString('cs-CZ')} Kč</strong> byla zpracována.
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-xs">
              🎭 DEMO - Skutečná platba nebyla provedena
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'error') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold mb-2 text-red-800">Platba se nezdařila</h3>
          <p className="text-gray-600 mb-6">
            Při zpracování platby došlo k chybě. Zkuste to prosím znovu.
          </p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              Zkusit znovu
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Zrušit platbu
            </Button>
          </div>
          <div className="mt-4">
            <Badge variant="secondary" className="text-xs">
              🎭 DEMO - Simulovaná chyba platby
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Platba kartou
          </CardTitle>
          <CardDescription>
            Zabezpečená platba prostřednictvím platební brány
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Celková částka:</span>
            <span className="text-2xl font-bold">{totalAmount.toLocaleString('cs-CZ')} Kč</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Vaše údaje jsou chráněny SSL šifrováním</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Údaje platební karty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Číslo karty *</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                className="pr-12"
              />
              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Platnost *</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                type="password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardHolder">Jméno držitele karty *</Label>
            <Input
              id="cardHolder"
              placeholder="Jan Novák"
              value={cardData.cardHolder}
              onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Button 
              onClick={simulatePayment}
              className="w-full"
              disabled={!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardHolder}
            >
              <Lock className="w-4 h-4 mr-2" />
              Zaplatit {totalAmount.toLocaleString('cs-CZ')} Kč
            </Button>
            
            <Button onClick={onCancel} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na rezervaci
            </Button>
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              🎭 DEMO REŽIM - Zadejte libovolné údaje
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}