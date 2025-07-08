"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface AdminHeaderProps {
  user: {
    fullName: string
    email: string
    role: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const handleLogout = () => {
    // Temporarily redirect to login page
    window.location.href = "/login"
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Administrace penzionu</h2>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user.fullName}</span>
            <span className="text-gray-400">({user.role})</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Odhlásit se
          </Button>
        </div>
      </div>
    </header>
  )
}
