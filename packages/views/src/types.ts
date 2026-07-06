import type { ComponentType, ReactNode } from "react"
import type { Icon } from "@tabler/icons-react"

/**
 * A link renderer supplied by each app (e.g. `next/link`). The shared views
 * package stays framework-agnostic; apps pass their own router link so the
 * sidebar can render client-side navigations.
 */
export type LinkComponent = ComponentType<{
  href: string
  className?: string
  children?: ReactNode
}>

/** A single navigation link. */
export interface NavItem {
  title: string
  url: string
  icon?: Icon
  isActive?: boolean
  /** Optional trailing slot (e.g. a row-action menu), rendered after the link. */
  action?: ReactNode
}

/** A collapsible navigation group with a trigger and nested links. */
export interface NavGroup {
  title: string
  icon?: Icon
  defaultOpen?: boolean
  items: NavItem[]
}

/**
 * One region of the sidebar body. `links` renders a flat list (optionally under
 * a group label); `groups` renders collapsible two-level groups (doc style).
 */
export type SidebarSection =
  | { kind: "links"; label?: string; items: NavItem[]; className?: string }
  | { kind: "groups"; items: NavGroup[]; className?: string }

/** The brand shown in the sidebar header. */
export interface BrandInfo {
  title: string
  url: string
  icon: Icon
}

/** The signed-in user shown in the sidebar footer. */
export interface UserInfo {
  name: string
  email: string
}

/** An action row inside the user dropdown. */
export interface UserMenuItem {
  label: string
  icon?: Icon
  onClick?: () => void
}
