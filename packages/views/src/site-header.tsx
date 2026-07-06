"use client"

import * as React from "react"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { LanguageMenu, ThemeMenu } from "@workspace/ui/components/settings-menu"

export interface SiteHeaderProps {
  /** A plain title string, rendered when `children` is not provided. */
  title?: string
  /** Custom header content (e.g. a breadcrumb); takes precedence over `title`. */
  children?: React.ReactNode
}

export function SiteHeader({ title, children }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) [&_svg]:size-3.5!">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4! self-center" />
        {children ?? <h1 className="text-sm font-medium">{title}</h1>}
        <div className="ml-auto flex items-center gap-1">
          <LanguageMenu />
          <ThemeMenu />
        </div>
      </div>
    </header>
  )
}
