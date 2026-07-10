"use client"

import { useTranslation } from "@workspace/i18n"
import { ApiUsersSection } from "@/components/api-reference"

export default function ApiUsersPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">
          {t("doc.nav.apiUsers")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("doc.api.description", { baseUrl: "http://localhost:3528" })}
        </p>
      </header>

      <ApiUsersSection />
    </div>
  )
}
