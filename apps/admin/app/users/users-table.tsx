"use client"

import * as React from "react"
import { IconTrash } from "@tabler/icons-react"
import {
  ApiRequestError,
  deleteUser,
  getUsers,
  updateUser,
} from "@workspace/apis"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import type { User, UserRole } from "@workspace/schemas"
import { useTranslation } from "@workspace/i18n"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
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

// A pending action awaiting confirmation. `role` toggles the user's role to the
// opposite of its current value; `delete` removes the account.
type PendingAction =
  | { type: "role"; user: User }
  | { type: "delete"; user: User }

export function UsersTable() {
  const { t } = useTranslation()
  const tokens = useAuthStore((state) => state.tokens)
  const currentUser = useAuthStore((state) => state.user)
  const clear = useAuthStore((state) => state.clear)
  const [ready, setReady] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pending, setPending] = React.useState<PendingAction | null>(null)
  const [confirming, setConfirming] = React.useState(false)

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

  async function confirmRole(user: User) {
    if (!tokens) return
    const nextRole: UserRole = user.role === "admin" ? "user" : "admin"
    const updated = await updateUser(tokens.accessToken, user.id, {
      role: nextRole,
    })
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    toast.success(t("admin.users.updated", { name: updated.name }))
  }

  async function confirmDelete(user: User) {
    if (!tokens) return
    await deleteUser(tokens.accessToken, user.id)
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    toast.success(t("admin.users.deleted", { name: user.name }))
  }

  // Run the pending action, then close the dialog. Errors surface as toasts and
  // keep the dialog closed; the row is left untouched.
  async function runPending() {
    if (!pending) return
    setConfirming(true)
    try {
      if (pending.type === "role") {
        await confirmRole(pending.user)
      } else {
        await confirmDelete(pending.user)
      }
      setPending(null)
    } catch (error) {
      if (handleExpiredSession(error)) return
      const fallback =
        pending.type === "role"
          ? t("admin.users.updateFailed")
          : t("admin.users.deleteFailed")
      const message =
        error instanceof ApiRequestError ? error.message : fallback
      toast.error(message)
      setPending(null)
    } finally {
      setConfirming(false)
    }
  }

  if (!ready || !tokens) {
    return null
  }

  const dialogTitle =
    pending?.type === "delete"
      ? t("admin.users.deleteConfirmTitle")
      : t("admin.users.roleConfirmTitle")
  const dialogDescription = !pending
    ? ""
    : pending.type === "delete"
      ? t("admin.users.deleteConfirmDescription", {
          name: pending.user.name,
          email: pending.user.email,
        })
      : pending.user.role === "admin"
        ? t("admin.users.roleConfirmToUser", { name: pending.user.name })
        : t("admin.users.roleConfirmToAdmin", { name: pending.user.name })

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
            users.map((user) => {
              // Guard against self-lockout: an admin can't demote or delete
              // their own account (the backend enforces this for delete too).
              const isSelf = user.id === currentUser?.id
              return (
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isSelf}
                        onClick={() => setPending({ type: "role", user })}
                      >
                        {user.role === "admin"
                          ? t("admin.users.makeUser")
                          : t("admin.users.makeAdmin")}
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={isSelf}
                        onClick={() => setPending({ type: "delete", user })}
                        aria-label={t("admin.users.delete")}
                      >
                        <IconTrash />
                        {t("admin.users.delete")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !confirming) {
            setPending(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirming}>
              {t("admin.users.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={pending?.type === "delete" ? "destructive" : "default"}
              disabled={confirming}
              onClick={(event) => {
                // Keep the dialog open while the request runs; close on result.
                event.preventDefault()
                void runPending()
              }}
            >
              {pending?.type === "delete"
                ? t("admin.users.delete")
                : t("admin.users.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
