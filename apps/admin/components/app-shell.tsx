"use client"

import * as React from "react"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"
import { SiteHeader } from "@workspace/views/site-header"

import { AppSidebar } from "@/components/app-sidebar"
import { PageBreadcrumb } from "@/components/page-breadcrumb"

function AccessRequired() {
  const { t } = useTranslation()
  const clear = useAuthStore((state) => state.clear)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md flex-col gap-4 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          {t("admin.access.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.access.description")}
        </p>
        <div className="flex justify-center">
          <Button
            onClick={() => {
              clear()
              window.location.href = webLoginUrl(currentUrl())
            }}
          >
            {t("admin.access.switchAccount")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  // Signed out: bounce to the shared login on the web app, returning here after.
  React.useEffect(() => {
    if (ready && !user) {
      window.location.href = webLoginUrl(currentUrl())
    }
  }, [ready, user])

  // Wait for hydration, and while redirecting an unauthenticated visitor.
  if (!ready || !user) {
    return null
  }

  // Signed in but not an admin: no console access.
  if (user.role !== "admin") {
    return <AccessRequired />
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
