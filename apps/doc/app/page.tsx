"use client"

import Link from "next/link"
import { IconDatabase, IconFileText } from "@tabler/icons-react"
import { useTranslation } from "@workspace/i18n"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function Page() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">
          {t("doc.home.title")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("doc.home.description")}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/schema" className="block">
          <Card size="sm" className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDatabase className="size-4" />
                {t("doc.home.schemaCardTitle")}
              </CardTitle>
              <CardDescription>
                {t("doc.home.schemaCardDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/api/auth" className="block">
          <Card size="sm" className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFileText className="size-4" />
                {t("doc.home.apiCardTitle")}
              </CardTitle>
              <CardDescription>
                {t("doc.home.apiCardDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
