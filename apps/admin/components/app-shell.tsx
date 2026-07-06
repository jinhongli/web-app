"use client"

import { usePathname } from "next/navigation"
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

  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-4">
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
