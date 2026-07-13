"use client"

import * as React from "react"
import Link from "next/link"
import { IconDatabase, IconFileText, IconSitemap } from "@tabler/icons-react"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function Page() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return null
  }

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <div className="flex max-w-md flex-col gap-4 text-center">
          <h1 className="font-heading text-2xl font-semibold">
            {t("doc.landing.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("doc.landing.description")}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                window.location.href = webLoginUrl(currentUrl())
              }}
            >
              {t("doc.landing.signIn")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
        <Link href="/architecture" className="block">
          <Card size="sm" className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSitemap className="size-4" />
                {t("doc.home.architectureCardTitle")}
              </CardTitle>
              <CardDescription>
                {t("doc.home.architectureCardDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

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
