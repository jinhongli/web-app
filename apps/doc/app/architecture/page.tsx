"use client"

import { useTranslation } from "@workspace/i18n"
import { ArchitectureOverview } from "@/components/architecture-overview"

export default function ArchitecturePage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">
          {t("doc.architecture.title")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("doc.architecture.description")}
        </p>
      </header>

      <ArchitectureOverview />
    </div>
  )
}
