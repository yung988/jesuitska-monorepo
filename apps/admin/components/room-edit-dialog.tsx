"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface Room {
  id: string
  room_number: string
  room_type_id: string
  floor: number
  status: string
  room_types?: {
    id: string
    name: string
    description?: string
    price_per_night: number
    capacity: number
    amenities?: string[]
  }
}

interface RoomEditDialogProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RoomEditDialog({ room, open, onOpenChange, onSuccess }: RoomEditDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    room_number: room?.room_number || "",
    floor: room?.floor || 1,
    status: room?.status || "available",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = room ? "PUT" : "POST"
      const url = room ? `/api/rooms/${room.id}` : "/api/rooms"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Nepodařilo se uložit pokoj")
      }

      toast({
        title: room ? "Pokoj upraven" : "Pokoj přidán",
        description: `Pokoj ${formData.room_number} byl úspěšně ${room ? "upraven" : "přidán"}.`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit pokoj. Zkuste to prosím znovu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{room ? "Upravit pokoj" : "Přidat nový pokoj"}</DialogTitle>
            <DialogDescription>
              {room ? "Upravte informace o pokoji" : "Vyplňte informace o novém pokoji"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room_number" className="text-right">
                Číslo pokoje
              </Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">
                Patro
              </Label>
              <Input
                id="floor"
                type="number"
                min="0"
                max="10"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Stav
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Dostupný</SelectItem>
                  <SelectItem value="occupied">Obsazený</SelectItem>
                  <SelectItem value="maintenance">Údržba</SelectItem>
                  <SelectItem value="out_of_order">Mimo provoz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Zrušit
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ukládám..." : "Uložit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
