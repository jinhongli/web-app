"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n"

import { Button } from "@workspace/ui/components/button"

export default function Page() {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  // Signed-in visitors skip the landing and go straight to the dashboard.
  React.useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard")
    }
  }, [ready, user, router])

  // Wait for hydration, and while redirecting a signed-in visitor, so the
  // landing hero never flashes before the persisted store is read.
  if (!ready || user) {
    return null
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md flex-col gap-4 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          {t("web.home.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("web.home.description")}
        </p>
        <div className="flex justify-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/login">{t("web.home.signIn")}</Link>}
          />
          <Button
            nativeButton={false}
            variant="outline"
            render={
              <Link href="/register">{t("web.home.createAccount")}</Link>
            }
          />
        </div>
      </div>
    </div>
  )
}
