"use client"

import Link from "next/link"
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    nameKey: TranslationKey
    url: string
    icon: Icon
  }[]
}) {
  const { isMobile } = useSidebar()
  const { t } = useTranslation()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("web.dashboard.nav.documents")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.nameKey}>
            <SidebarMenuButton render={<Link href={item.url} />}>
              <item.icon />
              <span>{t(item.nameKey)}</span>
            </SidebarMenuButton>
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
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>{t("web.dashboard.nav.more")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
