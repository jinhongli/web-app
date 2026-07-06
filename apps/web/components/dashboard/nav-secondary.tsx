"use client"

import * as React from "react"
import Link from "next/link"
import { type Icon } from "@tabler/icons-react"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    titleKey: TranslationKey
    url: string
    icon: Icon
  }[]
} & React.ComponentProps<typeof SidebarGroup>) {
  const { t } = useTranslation()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton render={<Link href={item.url} />}>
                <item.icon />
                <span>{t(item.titleKey)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
