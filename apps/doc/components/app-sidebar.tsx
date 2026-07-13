"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconDatabase,
  IconFileText,
  IconSitemap,
} from "@tabler/icons-react"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import { AppSidebar as ViewsAppSidebar } from "@workspace/views/app-sidebar"
import type { SidebarSection } from "@workspace/views/types"

type NavGroupConfig = {
  labelKey: TranslationKey
  icon: typeof IconFileText
  items: { href: string; labelKey: TranslationKey }[]
}

const navGroups: NavGroupConfig[] = [
  {
    labelKey: "doc.nav.databaseSchema",
    icon: IconDatabase,
    items: [
      { href: "/schema", labelKey: "doc.nav.schemaEr" },
      { href: "/schema/users", labelKey: "doc.nav.schemaUsers" },
    ],
  },
  {
    labelKey: "doc.nav.apiReference",
    icon: IconFileText,
    items: [
      { href: "/api/auth", labelKey: "doc.nav.apiAuth" },
      { href: "/api/users", labelKey: "doc.nav.apiUsers" },
    ],
  },
]

function isItemActive(pathname: string, href: string) {
  return href === "/schema"
    ? pathname === "/schema"
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const clear = useAuthStore((state) => state.clear)

  const sections: SidebarSection[] = [
    {
      kind: "links",
      items: [
        {
          title: t("doc.nav.architecture"),
          url: "/architecture",
          icon: IconSitemap,
          isActive: isItemActive(pathname, "/architecture"),
        },
      ],
    },
    {
      kind: "groups",
      items: navGroups.map((group) => ({
        title: t(group.labelKey),
        icon: group.icon,
        defaultOpen: group.items.some((item) => isItemActive(pathname, item.href)),
        items: group.items.map((item) => ({
          title: t(item.labelKey),
          url: item.href,
          isActive: isItemActive(pathname, item.href),
        })),
      })),
    },
  ]

  return (
    <ViewsAppSidebar
      variant="inset"
      link={Link}
      brand={{ title: t("doc.nav.brand"), url: "/", icon: IconBook }}
      sections={sections}
      user={{
        user: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
        signOutLabel: t("doc.nav.signOut"),
        onSignOut: () => {
          clear()
          window.location.href = webLoginUrl(currentUrl())
        },
      }}
    />
  )
}
