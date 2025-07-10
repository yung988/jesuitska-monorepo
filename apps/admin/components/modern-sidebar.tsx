"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Bed, Users, FileText, BarChart3, Settings, ChevronDown, Hotel } from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    title: "DENNÍ PROVOZ",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Rezervace", href: "/admin/reservations", icon: Calendar },
      { name: "Pokoje", href: "/admin/rooms", icon: Bed },
    ],
  },
  {
    title: "SPRÁVA",
    items: [
      { name: "Hosté", href: "/admin/guests", icon: Users },
      { name: "Faktury", href: "/admin/invoices", icon: FileText },
    ],
  },
  {
    title: "ÚČETNICTVÍ",
    items: [{ name: "Reporty", href: "/admin/reports", icon: BarChart3 }],
  },
  {
    title: "SYSTÉM",
    items: [
      { name: "Info o penzionu", href: "/admin/pension-info", icon: Hotel },
      { name: "Nastavení", href: "/admin/settings", icon: Settings },
    ],
  },
]

export function ModernSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(["DENNÍ PROVOZ"])

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  return (
    <div className="bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Hotel className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Pension Jesuitská</h1>
            <p className="text-xs text-gray-500">Znojmo • Est. 1994</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 hover:text-gray-700"
            >
              {section.title}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  expandedSections.includes(section.title) ? "rotate-180" : "",
                )}
              />
            </button>

            {expandedSections.includes(section.title) && (
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => console.log('Navigation clicked:', item.href)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700 border-r-2 border-green-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">OS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Ondřej Sabáček</p>
            <p className="text-xs text-gray-500">Správce penzionu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
