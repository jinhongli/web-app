"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconListDetails, IconShieldLock, IconUsers } from "@tabler/icons-react"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n"
import { AppSidebar as ViewsAppSidebar } from "@workspace/views/app-sidebar"
import type { SidebarSection } from "@workspace/views/types"

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
          title: t("admin.nav.users"),
          url: "/users",
          icon: IconUsers,
          isActive: pathname.startsWith("/users"),
        },
        {
          title: t("admin.nav.logs"),
          url: "/logs",
          icon: IconListDetails,
          isActive: pathname.startsWith("/logs"),
        },
      ],
    },
  ]

  return (
    <ViewsAppSidebar
      variant="inset"
      link={Link}
      brand={{ title: t("admin.nav.brand"), url: "/", icon: IconShieldLock }}
      sections={sections}
      user={{
        user: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
        signOutLabel: t("common.signOut"),
        onSignOut: () => {
          clear()
          window.location.href = webLoginUrl(currentUrl())
        },
      }}
    />
  )
}
