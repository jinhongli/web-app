"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconChartBar,
  IconCirclePlusFilled,
  IconDashboard,
  IconDatabase,
  IconDots,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMail,
  IconReport,
  IconSearch,
  IconSettings,
  IconShare3,
  IconTrash,
  IconUsers,
  IconCreditCard,
  IconFileWord,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"
import { useAuthStore } from "@workspace/auth"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { AppSidebar as ViewsAppSidebar } from "@workspace/views/app-sidebar"
import type { NavItem, SidebarSection } from "@workspace/views/types"

const navMain: {
  titleKey: TranslationKey
  url: string
  icon: typeof IconDashboard
}[] = [
  {
    titleKey: "web.dashboard.nav.dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
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

const documents: {
  nameKey: TranslationKey
  url: string
  icon: typeof IconDatabase
}[] = [
  { nameKey: "web.dashboard.nav.dataLibrary", url: "#", icon: IconDatabase },
  { nameKey: "web.dashboard.nav.reports", url: "#", icon: IconReport },
  { nameKey: "web.dashboard.nav.wordAssistant", url: "#", icon: IconFileWord },
]

/** Web's quick-create CTA row, rendered at the top of the shared sidebar body. */
function QuickCreate() {
  const { t } = useTranslation()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip={t("web.dashboard.quickCreate")}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <IconCirclePlusFilled />
              <span>{t("web.dashboard.quickCreate")}</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">{t("web.dashboard.inbox")}</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/** The per-document row-action menu, passed to the shared nav item `action`. */
function DocumentAction() {
  const { isMobile } = useSidebar()
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuAction
            showOnHover
            className="rounded-sm data-[popup-open]:bg-accent"
          >
            <IconDots />
            <span className="sr-only">{t("web.dashboard.nav.more")}</span>
          </SidebarMenuAction>
        }
      />
      <DropdownMenuContent
        className="w-24 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        <DropdownMenuItem>
          <IconFolder />
          <span>{t("web.dashboard.nav.open")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconShare3 />
          <span>{t("web.dashboard.nav.share")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <IconTrash />
          <span>{t("web.dashboard.nav.delete")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({
  ...props
}: Omit<
  React.ComponentProps<typeof ViewsAppSidebar>,
  "link" | "brand" | "sections" | "user"
>) {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const clear = useAuthStore((state) => state.clear)

  const sections: SidebarSection[] = [
    {
      kind: "links",
      items: navMain.map((item) => ({
        title: t(item.titleKey),
        url: item.url,
        icon: item.icon,
      })),
    },
    {
      kind: "links",
      label: t("web.dashboard.nav.documents"),
      className: "group-data-[collapsible=icon]:hidden",
      items: documents.map<NavItem>((item) => ({
        title: t(item.nameKey),
        url: item.url,
        icon: item.icon,
        action: <DocumentAction />,
      })),
    },
    {
      kind: "links",
      className: "mt-auto",
      items: navSecondary.map((item) => ({
        title: t(item.titleKey),
        url: item.url,
        icon: item.icon,
      })),
    },
  ]

  return (
    <ViewsAppSidebar
      link={Link}
      brand={{
        title: t("web.dashboard.brand"),
        url: "/dashboard",
        icon: IconInnerShadowTop,
      }}
      topContent={<QuickCreate />}
      sections={sections}
      user={{
        user: {
          name: user?.name ?? "shadcn",
          email: user?.email ?? "m@example.com",
        },
        items: [
          { label: t("web.dashboard.user.account"), icon: IconUserCircle },
          { label: t("web.dashboard.user.billing"), icon: IconCreditCard },
          {
            label: t("web.dashboard.user.notifications"),
            icon: IconNotification,
          },
        ],
        signOutLabel: t("web.dashboard.user.logout"),
        onSignOut: () => {
          clear()
          router.push("/login")
        },
      }}
      {...props}
    />
  )
}
