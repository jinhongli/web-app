"use client"

import { useTranslation, type TranslationKey } from "@workspace/i18n"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type Endpoint = {
  method: "GET" | "POST" | "PATCH"
  path: string
  summaryKey: TranslationKey
  auth: boolean
  body?: string
}

const endpoints: { groupKey: TranslationKey; items: Endpoint[] }[] = [
  {
    groupKey: "doc.api.groupAuth",
    items: [
      {
        method: "POST",
        path: "/api/auth/register",
        summaryKey: "doc.api.registerSummary",
        auth: false,
        body: "{ email, name, password }",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        summaryKey: "doc.api.loginSummary",
        auth: false,
        body: "{ email, password }",
      },
      {
        method: "POST",
        path: "/api/auth/refresh",
        summaryKey: "doc.api.refreshSummary",
        auth: false,
        body: "{ refreshToken }",
      },
    ],
  },
  {
    groupKey: "doc.api.groupUsers",
    items: [
      {
        method: "GET",
        path: "/api/users/me",
        summaryKey: "doc.api.meSummary",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/users",
        summaryKey: "doc.api.listSummary",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/users/:id",
        summaryKey: "doc.api.getSummary",
        auth: true,
      },
      {
        method: "PATCH",
        path: "/api/users/:id",
        summaryKey: "doc.api.updateSummary",
        auth: true,
        body: "{ name?, role? }",
      },
    ],
  },
]

const methodVariant = {
  GET: "secondary",
  POST: "default",
  PATCH: "outline",
} as const

export default function Page() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">
          {t("doc.api.title")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("doc.api.description", { baseUrl: "http://localhost:8080" })}
        </p>
      </header>

      {endpoints.map((section) => (
        <section key={section.groupKey} className="flex flex-col gap-3">
          <h2 className="font-heading text-sm font-medium">
            {t(section.groupKey)}
          </h2>
          <div className="flex flex-col gap-2">
            {section.items.map((endpoint) => (
              <Card key={`${endpoint.method} ${endpoint.path}`} size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <Badge variant={methodVariant[endpoint.method]}>
                      {endpoint.method}
                    </Badge>
                    <span>{endpoint.path}</span>
                    {endpoint.auth ? (
                      <Badge variant="outline">{t("doc.api.authBadge")}</Badge>
                    ) : null}
                  </CardTitle>
                  <CardDescription>{t(endpoint.summaryKey)}</CardDescription>
                </CardHeader>
                {endpoint.body ? (
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {t("doc.api.bodyLabel")}:{" "}
                      <code className="font-mono">{endpoint.body}</code>
                    </p>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
