"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { SiteHeader } from "@workspace/views/site-header"

import { AppSidebar } from "@/components/app-sidebar"
import { PageBreadcrumb } from "@/components/page-breadcrumb"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  // The home page (`/`) is public: it shows a landing hero when signed out.
  // Every other route is protected and bounces to the shared web login.
  const isPublic = pathname === "/"

  React.useEffect(() => {
    if (ready && !user && !isPublic) {
      window.location.href = webLoginUrl(currentUrl())
    }
  }, [ready, user, isPublic])

  // Render the bare page (no sidebar) on the landing home until we know the
  // user is signed in. Gating the home on hydration avoids briefly flashing
  // the sidebar chrome before the persisted store is read on the client.
  const chromeless = pathname === "/" && (!ready || !user)

  if (chromeless) {
    return <>{children}</>
  }

  // Block protected content until we know the user is signed in.
  if (!ready || (!user && !isPublic)) {
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
      <AppSidebar />
      <SidebarInset>
        <SiteHeader>
          <PageBreadcrumb />
        </SiteHeader>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
