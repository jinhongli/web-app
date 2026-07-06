"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "@workspace/i18n"
import { SettingsMenu } from "@workspace/ui/components/settings-menu"

import { cn } from "@workspace/ui/lib/utils"

const links = [
  { href: "/", labelKey: "doc.nav.apiReference" as const },
  { href: "/schema", labelKey: "doc.nav.databaseSchema" as const },
]

export function SiteNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-3xl items-center gap-4 px-6 py-3">
        <span className="font-heading text-sm font-semibold">
          {t("doc.nav.brand")}
        </span>
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2 py-1 text-xs transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(link.labelKey)}
              </Link>
            )
          })}
        </div>
        <div className="ml-auto">
          <SettingsMenu />
        </div>
      </nav>
    </header>
  )
}
