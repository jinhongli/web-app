"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { useAuthStore } from "@/lib/auth-store"

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const clear = useAuthStore((state) => state.clear)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (ready && !user) {
      router.replace("/login")
    }
  }, [ready, user, router])

  if (!ready || !user) {
    return null
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("web.dashboard.welcome", { name: user.name })}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {t("web.dashboard.role", { role: user.role })}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              clear()
              router.push("/login")
            }}
          >
            {t("web.dashboard.signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
