"use client"

import * as React from "react"
import { ApiRequestError, getUsers, updateUser } from "@workspace/apis"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import type { User, UserRole } from "@workspace/schemas"
import { useTranslation } from "@workspace/i18n"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { toast } from "@workspace/ui/components/sonner"
import { formatDateTime } from "@workspace/utils"

export function UsersTable() {
  const { t } = useTranslation()
  const tokens = useAuthStore((state) => state.tokens)
  const clear = useAuthStore((state) => state.clear)
  const [ready, setReady] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (ready && !tokens) {
      window.location.href = webLoginUrl(currentUrl())
    }
  }, [ready, tokens])

  const handleExpiredSession = React.useCallback(
    (error: unknown) => {
      if (error instanceof ApiRequestError && error.status === 401) {
        clear()
        window.location.href = webLoginUrl(currentUrl())
        return true
      }
      return false
    },
    [clear]
  )

  const load = React.useCallback(async () => {
    if (!tokens) return
    setLoading(true)
    try {
      const page = await getUsers(tokens.accessToken, { page: 1, pageSize: 50 })
      setUsers(page.items)
    } catch (error) {
      if (handleExpiredSession(error)) return
      const message =
        error instanceof ApiRequestError ? error.message : t("admin.users.loadFailed")
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [tokens, t, handleExpiredSession])

  React.useEffect(() => {
    if (ready && tokens) {
      void load()
    }
  }, [ready, tokens, load])

  async function toggleRole(user: User) {
    if (!tokens) return
    const nextRole: UserRole = user.role === "admin" ? "user" : "admin"
    try {
      const updated = await updateUser(tokens.accessToken, user.id, {
        role: nextRole,
      })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      toast.success(t("admin.users.updated", { name: updated.name }))
    } catch (error) {
      if (handleExpiredSession(error)) return
      const message =
        error instanceof ApiRequestError ? error.message : t("admin.users.updateFailed")
      toast.error(message)
    }
  }

  if (!ready || !tokens) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold">
            {t("admin.users.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("admin.users.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t("admin.users.refresh")}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.users.colName")}</TableHead>
            <TableHead>{t("admin.users.colEmail")}</TableHead>
            <TableHead>{t("admin.users.colRole")}</TableHead>
            <TableHead>{t("admin.users.colCreated")}</TableHead>
            <TableHead className="text-right">
              {t("admin.users.colActions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {t("admin.users.loading")}
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {t("admin.users.empty")}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => void toggleRole(user)}
                  >
                    {user.role === "admin"
                      ? t("admin.users.makeUser")
                      : t("admin.users.makeAdmin")}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
