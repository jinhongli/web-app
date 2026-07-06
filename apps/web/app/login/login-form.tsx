"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ApiRequestError, login } from "@workspace/apis"
import { isAllowedRedirect } from "@workspace/auth"
import { loginSchema } from "@workspace/schemas"
import { useTranslation } from "@workspace/i18n"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"

import { useAuthStore } from "@/lib/auth-store"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [pending, setPending] = React.useState(false)

  function redirectAfterAuth() {
    const next = searchParams.get("next")
    if (next && isAllowedRedirect(next)) {
      // Absolute URLs may point at a sibling app (admin/doc); use a full
      // navigation so the shared session cookie is picked up there.
      if (next.startsWith("http")) {
        window.location.href = next
      } else {
        router.push(next)
      }
      return
    }
    router.push("/dashboard")
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("common.invalidInput"))
      return
    }

    setPending(true)
    try {
      const result = await login(parsed.data)
      setAuth(result.user, result.tokens)
      toast.success(t("common.signedIn"))
      redirectAfterAuth()
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : t("common.signInFailed")
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("web.login.title")}</CardTitle>
        <CardDescription>{t("web.login.description")}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("common.password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("common.signingIn") : t("common.signIn")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("web.login.noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t("web.login.createOne")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
