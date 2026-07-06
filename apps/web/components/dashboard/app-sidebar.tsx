"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

import { useAuthStore } from "@/lib/auth-store"
import { NavDocuments } from "@/components/dashboard/nav-documents"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"

const navMain: { titleKey: TranslationKey; url: string; icon: typeof IconDashboard }[] =
  [
    { titleKey: "web.dashboard.nav.dashboard", url: "/dashboard", icon: IconDashboard },
    { titleKey: "web.dashboard.nav.lifecycle", url: "#", icon: IconListDetails },
    { titleKey: "web.dashboard.nav.analytics", url: "#", icon: IconChartBar },
    { titleKey: "web.dashboard.nav.projects", url: "#", icon: IconFolder },
    { titleKey: "web.dashboard.nav.team", url: "#", icon: IconUsers },
  ]

const navSecondary: {
  titleKey: TranslationKey
  url: string
  icon: typeof IconSettings
}[] = [
  { titleKey: "web.dashboard.nav.settings", url: "#", icon: IconSettings },
  { titleKey: "web.dashboard.nav.getHelp", url: "#", icon: IconHelp },
  { titleKey: "web.dashboard.nav.search", url: "#", icon: IconSearch },
]

const documents: { nameKey: TranslationKey; url: string; icon: typeof IconDatabase }[] =
  [
    { nameKey: "web.dashboard.nav.dataLibrary", url: "#", icon: IconDatabase },
    { nameKey: "web.dashboard.nav.reports", url: "#", icon: IconReport },
    { nameKey: "web.dashboard.nav.wordAssistant", url: "#", icon: IconFileWord },
  ]

// Referenced from the dashboard-01 block; kept for parity but not rendered.
export const navClouds = [
  { icon: IconCamera },
  { icon: IconFileDescription },
  { icon: IconFileAi },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <IconInnerShadowTop className="size-5!" />
              <span className="text-base font-semibold">
                {t("web.dashboard.brand")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "shadcn",
            email: user?.email ?? "m@example.com",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
