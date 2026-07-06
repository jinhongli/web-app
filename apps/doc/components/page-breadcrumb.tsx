"use client"

import { usePathname } from "next/navigation"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

const trails: Record<string, TranslationKey[]> = {
  "/schema": ["doc.nav.databaseSchema", "doc.nav.schemaEr"],
  "/schema/users": ["doc.nav.databaseSchema", "doc.nav.schemaUsers"],
  "/api/auth": ["doc.nav.apiReference", "doc.nav.apiAuth"],
  "/api/users": ["doc.nav.apiReference", "doc.nav.apiUsers"],
}

export function PageBreadcrumb() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const trail = trails[pathname] ?? []
  if (trail.length === 0) {
    return null
  }

  const lastIndex = trail.length - 1

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        {trail.map((labelKey, index) => {
          const label = t(labelKey)
          return (
            <BreadcrumbItem key={`${labelKey}-${index}`}>
              {index === lastIndex ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <>
                  <span>{label}</span>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
