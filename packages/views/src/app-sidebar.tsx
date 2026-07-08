"use client"

import * as React from "react"
import { IconChevronRight } from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

import { NavUser, type NavUserProps } from "@workspace/views/nav-user"
import type {
  BrandInfo,
  LinkComponent,
  NavGroup,
  NavItem,
  SidebarSection,
} from "@workspace/views/types"

export interface AppSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  /** App-supplied router link (e.g. `next/link`). */
  link: LinkComponent
  brand: BrandInfo
  sections: SidebarSection[]
  user: NavUserProps
  /** Optional content rendered at the top of the sidebar body (e.g. a CTA). */
  topContent?: React.ReactNode
}

function FlatLinks({
  link: Link,
  label,
  items,
  className,
}: {
  link: LinkComponent
  label?: string
  items: NavItem[]
  className?: string
}) {
  return (
    <SidebarGroup className={className}>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={item.isActive}
                render={<Link href={item.url} />}
              >
                {item.icon ? <item.icon /> : null}
                <span>{item.title}</span>
              </SidebarMenuButton>
              {item.action}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function CollapsibleGroup({
  link: Link,
  group,
}: {
  link: LinkComponent
  group: NavGroup
}) {
  const Icon = group.icon
  const active = group.defaultOpen ?? false
  // Controlled open state: the Collapsible lives in a persistent layout, so
  // driving `open` from the pathname-derived `defaultOpen` would flip an
  // already-initialized uncontrolled Collapsible on navigation (Base UI warns).
  // Seed from the active state and auto-expand when navigation activates the
  // group, while leaving the user free to toggle it otherwise.
  const [open, setOpen] = React.useState(active)

  React.useEffect(() => {
    if (active) {
      setOpen(true)
    }
  }, [active])

  return (
    <SidebarMenuCollapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuCollapsibleTrigger
        render={
          <SidebarMenuButton tooltip={group.title}>
            {Icon ? <Icon /> : null}
            <span>{group.title}</span>
            <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[open]/menu-item:rotate-90" />
          </SidebarMenuButton>
        }
      />
      <SidebarMenuCollapsiblePanel>
        <SidebarMenuSub>
          {group.items.map((item) => (
            <SidebarMenuSubItem key={item.url}>
              <SidebarMenuSubButton
                isActive={item.isActive}
                render={<Link href={item.url} />}
              >
                <span>{item.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </SidebarMenuCollapsiblePanel>
    </SidebarMenuCollapsible>
  )
}

function CollapsibleGroups({
  link: Link,
  groups,
  className,
}: {
  link: LinkComponent
  groups: NavGroup[]
  className?: string
}) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          {groups.map((group) => (
            <CollapsibleGroup key={group.title} link={Link} group={group} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({
  link: Link,
  brand,
  sections,
  user,
  topContent,
  ...props
}: AppSidebarProps) {
  const BrandIcon = brand.icon

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href={brand.url} />}
            >
              <BrandIcon className="size-5!" />
              <span className="text-base font-semibold">{brand.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {topContent}
        {sections.map((section, index) =>
          section.kind === "links" ? (
            <FlatLinks
              key={section.label ?? `links-${index}`}
              link={Link}
              label={section.label}
              items={section.items}
              className={section.className}
            />
          ) : (
            <CollapsibleGroups
              key={`groups-${index}`}
              link={Link}
              groups={section.items}
              className={section.className}
            />
          )
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser {...user} />
      </SidebarFooter>
    </Sidebar>
  )
}
