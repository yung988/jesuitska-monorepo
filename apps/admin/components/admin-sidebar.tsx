"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Users, Bed, FileText, BarChart3, Settings, Home } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Rezervace", href: "/admin/reservations", icon: Calendar },
  { name: "Hosté", href: "/admin/guests", icon: Users },
  { name: "Pokoje", href: "/admin/rooms", icon: Bed },
  { name: "Faktury", href: "/admin/invoices", icon: FileText },
  { name: "Reporty", href: "/admin/reports", icon: BarChart3 },
  { name: "Nastavení", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-gray-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Pension Jesuitská</h1>
        <p className="text-gray-400 text-sm">Admin Panel</p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 py-2 px-4 rounded transition duration-200",
                isActive ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
