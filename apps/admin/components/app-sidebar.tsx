"use client"

import * as React from "react"
import {
  BarChartIcon,
  Bed,
  Calendar,
  CreditCard,
  DollarSign,
  Home,
  LayoutDashboardIcon,
  Receipt,
  Settings,
  Users,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@jesuitska.cz",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Rezervace",
      url: "/admin/reservations",
      icon: Calendar,
    },
    {
      title: "Pokoje",
      url: "/admin/rooms",
      icon: Bed,
    },
    {
      title: "Hosté",
      url: "/admin/guests",
      icon: Users,
    },
    {
      title: "Faktury",
      url: "/admin/invoices",
      icon: Receipt,
    },
    {
      title: "Platby",
      url: "/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Tržby",
      url: "/admin/revenue",
      icon: DollarSign,
    },
    {
      title: "Statistiky",
      url: "/admin/analytics",
      icon: BarChartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Nastavení",
      url: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Zpět na web",
      url: "/",
      icon: Home,
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <Home className="h-5 w-5" />
                <span className="text-base font-semibold">Penzion Jesuitská</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
