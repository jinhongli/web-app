"use client"

import Link from "next/link"
import { IconListDetails, IconUsers } from "@tabler/icons-react"
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
          {t("admin.home.title")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("admin.home.description")}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/users" className="block">
          <Card size="sm" className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="size-4" />
                {t("admin.home.usersCardTitle")}
              </CardTitle>
              <CardDescription>
                {t("admin.home.usersCardDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/logs" className="block">
          <Card size="sm" className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconListDetails className="size-4" />
                {t("admin.home.logsCardTitle")}
              </CardTitle>
              <CardDescription>
                {t("admin.home.logsCardDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
