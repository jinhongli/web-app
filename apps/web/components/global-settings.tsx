"use client"

import { usePathname } from "next/navigation"
import { SettingsMenu } from "@workspace/ui/components/settings-menu"

export function GlobalSettings() {
  const pathname = usePathname()

  if (pathname.startsWith("/dashboard")) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <SettingsMenu />
    </div>
  )
}
