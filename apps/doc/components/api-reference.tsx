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

const authEndpoints: Endpoint[] = [
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
]

const usersEndpoints: Endpoint[] = [
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
]

const methodVariant = {
  GET: "secondary",
  POST: "default",
  PATCH: "outline",
} as const

function EndpointList({ items }: { items: Endpoint[] }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      {items.map((endpoint) => (
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
  )
}

export function ApiAuthSection() {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-sm font-medium">
        {t("doc.api.groupAuth")}
      </h2>
      <EndpointList items={authEndpoints} />
    </section>
  )
}

export function ApiUsersSection() {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-sm font-medium">
        {t("doc.api.groupUsers")}
      </h2>
      <EndpointList items={usersEndpoints} />
    </section>
  )
}
