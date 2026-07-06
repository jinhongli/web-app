"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { LanguageMenu, ThemeMenu } from "@workspace/ui/components/settings-menu"

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-4 [&_svg]:size-3.5!">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4! self-center" />
          <PageBreadcrumb />
          <div className="ml-auto flex items-center gap-1">
            <LanguageMenu />
            <ThemeMenu />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
