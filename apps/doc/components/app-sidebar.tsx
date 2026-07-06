"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBook,
  IconChevronRight,
  IconDatabase,
  IconFileText,
  IconLogout,
} from "@tabler/icons-react"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuCollapsible,
  SidebarMenuCollapsiblePanel,
  SidebarMenuCollapsibleTrigger,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"

type NavGroup = {
  labelKey: TranslationKey
  icon: typeof IconFileText
  items: { href: string; labelKey: TranslationKey }[]
}

const navGroups: NavGroup[] = [
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
  const clear = useAuthStore((state) => state.clear)

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              tooltip={t("doc.nav.brand")}
            >
              <IconBook />
              <span className="font-heading font-semibold">
                {t("doc.nav.brand")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGroups.map((group) => {
                const Icon = group.icon
                const groupActive = group.items.some((item) =>
                  isItemActive(pathname, item.href)
                )
                return (
                  <SidebarMenuCollapsible
                    key={group.labelKey}
                    defaultOpen={groupActive}
                  >
                    <SidebarMenuCollapsibleTrigger
                      render={
                        <SidebarMenuButton tooltip={t(group.labelKey)}>
                          <Icon />
                          <span>{t(group.labelKey)}</span>
                          <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[open]/menu-item:rotate-90" />
                        </SidebarMenuButton>
                      }
                    />
                    <SidebarMenuCollapsiblePanel>
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              isActive={isItemActive(pathname, item.href)}
                              render={<Link href={item.href} />}
                            >
                              <span>{t(item.labelKey)}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarMenuCollapsiblePanel>
                  </SidebarMenuCollapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t("doc.nav.signOut")}
              onClick={() => {
                clear()
                window.location.href = webLoginUrl(currentUrl())
              }}
            >
              <IconLogout />
              <span>{t("doc.nav.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
