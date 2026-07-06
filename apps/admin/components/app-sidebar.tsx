"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconLogout, IconShieldLock, IconUsers } from "@tabler/icons-react"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const clear = useAuthStore((state) => state.clear)

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/users" />}
              tooltip={t("admin.nav.brand")}
            >
              <IconShieldLock />
              <span className="font-heading font-semibold">
                {t("admin.nav.brand")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/users")}
                  render={<Link href="/users" />}
                  tooltip={t("admin.nav.users")}
                >
                  <IconUsers />
                  <span>{t("admin.nav.users")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("common.signOut")}
              onClick={() => {
                clear()
                window.location.href = webLoginUrl(currentUrl())
              }}
            >
              <IconLogout />
              <span>{t("common.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
