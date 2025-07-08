import type React from "react"
import { ModernSidebar } from "@/components/modern-sidebar"
import { ModernHeader } from "@/components/modern-header"
import { requireAuth } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  
  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModernHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}
