"use client"

import { useTranslation } from "@workspace/i18n"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { LanguageMenu, ThemeMenu } from "@workspace/ui/components/settings-menu"

export function SiteHeader() {
  const { t } = useTranslation()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) [&_svg]:size-3.5!">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4! self-center"
        />
        <h1 className="text-sm font-medium">
          {t("web.dashboard.headerTitle")}
        </h1>
        <div className="ml-auto flex items-center gap-1">
          <LanguageMenu />
          <ThemeMenu />
        </div>
      </div>
    </header>
  )
}
