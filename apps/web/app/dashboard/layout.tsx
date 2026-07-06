"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"

import { useAuthStore } from "@/lib/auth-store"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (ready && !user) {
      router.replace("/login")
    }
  }, [ready, user, router])

  if (!ready || !user) {
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
