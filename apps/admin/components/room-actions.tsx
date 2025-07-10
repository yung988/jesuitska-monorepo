"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface RoomActionsProps {
  roomId: string
  roomNumber: string
}

export function RoomActions({ roomId, roomNumber }: RoomActionsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEdit = () => {
    // TODO: Open edit dialog
    toast({
      title: "Editace pokoje",
      description: `Editace pokoje ${roomNumber} bude brzy dostupná.`,
    })
  }

  const handleDelete = async () => {
    if (!confirm(`Opravdu chcete smazat pokoj ${roomNumber}?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete room")

      toast({
        title: "Pokoj smazán",
        description: `Pokoj ${roomNumber} byl úspěšně smazán.`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat pokoj.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Akce</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Upravit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Smazat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
