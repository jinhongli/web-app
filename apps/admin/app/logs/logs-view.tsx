"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCalendar,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import type { DateRange } from "react-day-picker"

import { ApiRequestError, getLogChain, getLogs, getUsers } from "@workspace/apis"
import { currentUrl, useAuthStore, webLoginUrl } from "@workspace/auth"
import type { LogChain, LogLevel, RequestLog } from "@workspace/schemas"
import { useTranslation } from "@workspace/i18n"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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

type UserOption = { value: string; label: string }

const LEVEL_ALL = "all"
const LEVELS: LogLevel[] = ["debug", "info", "warn", "error"]

function levelBadgeVariant(
  level: string
): React.ComponentProps<typeof Badge>["variant"] {
  switch (level) {
    case "error":
      return "destructive"
    case "warn":
      return "secondary"
    default:
      return "outline"
  }
}

function startOfDayISO(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function endOfDayISO(date: Date): string {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export function LogsView() {
  const { t } = useTranslation()
  const tokens = useAuthStore((state) => state.tokens)
  const clear = useAuthStore((state) => state.clear)

  const [ready, setReady] = React.useState(false)
  const [logs, setLogs] = React.useState<RequestLog[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  // Filters.
  const [keyword, setKeyword] = React.useState("")
  const [debouncedKeyword, setDebouncedKeyword] = React.useState("")
  const [userOptions, setUserOptions] = React.useState<UserOption[]>([])
  const [selectedUser, setSelectedUser] = React.useState<UserOption | null>(null)
  const [level, setLevel] = React.useState<string>(LEVEL_ALL)
  const [range, setRange] = React.useState<DateRange | undefined>(undefined)

  // Pagination.
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Detail drawer.
  const [detailLog, setDetailLog] = React.useState<RequestLog | null>(null)
  const [chain, setChain] = React.useState<LogChain | null>(null)
  const [chainLoading, setChainLoading] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (ready && !tokens) {
      window.location.href = webLoginUrl(currentUrl())
    }
  }, [ready, tokens])

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 350)
    return () => window.clearTimeout(id)
  }, [keyword])

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

  // Reset to first page whenever a filter changes.
  React.useEffect(() => {
    setPage(1)
  }, [debouncedKeyword, selectedUser, level, range?.from, range?.to, pageSize])

  const load = React.useCallback(async () => {
    if (!tokens) return
    setLoading(true)
    try {
      const result = await getLogs(tokens.accessToken, {
        page,
        pageSize,
        keyword: debouncedKeyword || undefined,
        userId: selectedUser?.value || undefined,
        level: level === LEVEL_ALL ? undefined : (level as LogLevel),
        from: range?.from ? startOfDayISO(range.from) : undefined,
        to: range?.to ? endOfDayISO(range.to) : undefined,
      })
      setLogs(result.items)
      setTotal(result.total)
    } catch (error) {
      if (handleExpiredSession(error)) return
      const message =
        error instanceof ApiRequestError
          ? error.message
          : t("admin.logs.loadFailed")
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [
    tokens,
    page,
    pageSize,
    debouncedKeyword,
    selectedUser,
    level,
    range?.from,
    range?.to,
    handleExpiredSession,
    t,
  ])

  React.useEffect(() => {
    if (ready && tokens) {
      void load()
    }
  }, [ready, tokens, load])

  // Load the user list once for the user filter.
  React.useEffect(() => {
    if (!ready || !tokens) return
    let cancelled = false
    void (async () => {
      try {
        const result = await getUsers(tokens.accessToken, { pageSize: 100 })
        if (cancelled) return
        setUserOptions(
          result.items.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))
        )
      } catch (error) {
        if (handleExpiredSession(error)) return
        // The user filter is optional; surface but don't block the page.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, tokens, handleExpiredSession])

  const openDetail = React.useCallback(
    async (log: RequestLog) => {
      setDetailLog(log)
      setChain(null)
      if (!tokens) return
      setChainLoading(true)
      try {
        const result = await getLogChain(tokens.accessToken, log.id)
        setChain(result)
      } catch (error) {
        if (handleExpiredSession(error)) return
        const message =
          error instanceof ApiRequestError
            ? error.message
            : t("admin.logs.chainLoadFailed")
        toast.error(message)
      } finally {
        setChainLoading(false)
      }
    },
    [tokens, handleExpiredSession, t]
  )

  const columns = React.useMemo<ColumnDef<RequestLog>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: t("admin.logs.colTime"),
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "level",
        header: t("admin.logs.colLevel"),
        cell: ({ row }) => (
          <Badge variant={levelBadgeVariant(row.original.level)}>
            {row.original.level}
          </Badge>
        ),
      },
      {
        accessorKey: "method",
        header: t("admin.logs.colMethod"),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.method || "—"}</span>
        ),
      },
      {
        accessorKey: "path",
        header: t("admin.logs.colPath"),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.path || "—"}</span>
        ),
      },
      {
        accessorKey: "status",
        header: t("admin.logs.colStatus"),
        cell: ({ row }) =>
          row.original.status ? row.original.status : "—",
      },
      {
        accessorKey: "userId",
        header: t("admin.logs.colUser"),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.userId || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="sr-only">{t("admin.logs.colActions")}</span>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="xs"
              onClick={() => void openDetail(row.original)}
            >
              {t("admin.logs.viewDetails")}
            </Button>
          </div>
        ),
      },
    ],
    [t, openDetail]
  )

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex: page - 1, pageSize } },
  })

  const canPrevious = page > 1
  const canNext = page < pageCount

  function resetFilters() {
    setKeyword("")
    setSelectedUser(null)
    setLevel(LEVEL_ALL)
    setRange(undefined)
  }

  const rangeLabel = range?.from
    ? range.to
      ? `${formatDateTime(range.from)} – ${formatDateTime(range.to)}`
      : formatDateTime(range.from)
    : t("admin.logs.filterDateRangeAll")

  if (!ready || !tokens) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold">
            {t("admin.logs.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("admin.logs.description")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          {t("admin.logs.refresh")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="w-72"
          placeholder={t("admin.logs.searchPlaceholder")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <Combobox
          items={userOptions}
          value={selectedUser}
          onValueChange={(value) => setSelectedUser(value as UserOption | null)}
        >
          <ComboboxInput
            className="w-56"
            placeholder={t("admin.logs.filterUserPlaceholder")}
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>{t("admin.logs.filterUserEmpty")}</ComboboxEmpty>
            <ComboboxList>
              {(user: UserOption) => (
                <ComboboxItem key={user.value} value={user}>
                  {user.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Select value={level} onValueChange={(value) => setLevel(value as string)}>
          <SelectTrigger size="sm" className="w-32">
            <SelectValue placeholder={t("admin.logs.filterLevelAll")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LEVEL_ALL}>
              {t("admin.logs.filterLevelAll")}
            </SelectItem>
            {LEVELS.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {lvl}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm">
                <IconCalendar />
                <span className="max-w-56 truncate">{rangeLabel}</span>
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="sm" onClick={resetFilters}>
          {t("admin.logs.reset")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  {t("admin.logs.loading")}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  {t("admin.logs.empty")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            {t("admin.logs.rowsPerPage")}
          </Label>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-medium">
            {t("admin.logs.pageOf", { page, pages: pageCount })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage(1)}
              disabled={!canPrevious}
            >
              <span className="sr-only">{t("admin.logs.goFirst")}</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrevious}
            >
              <span className="sr-only">{t("admin.logs.goPrevious")}</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={!canNext}
            >
              <span className="sr-only">{t("admin.logs.goNext")}</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage(pageCount)}
              disabled={!canNext}
            >
              <span className="sr-only">{t("admin.logs.goLast")}</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      <Drawer
        swipeDirection="right"
        open={detailLog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailLog(null)
            setChain(null)
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader className="gap-1">
            <DrawerTitle>{t("admin.logs.detailTitle")}</DrawerTitle>
            <DrawerDescription>
              {t("admin.logs.detailDescription")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4 text-sm">
            {detailLog && (
              <LogDetail log={detailLog} t={t} />
            )}

            <div className="flex flex-col gap-2">
              <div className="font-heading text-sm font-medium">
                {t("admin.logs.callChain")}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin.logs.callChainDescription")}
              </p>
              {chainLoading ? (
                <div className="text-xs text-muted-foreground">
                  {t("admin.logs.loading")}
                </div>
              ) : (
                <CallChain
                  chain={chain}
                  activeId={detailLog?.id ?? ""}
                  t={t}
                />
              )}
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose
              render={<Button variant="outline">{t("admin.logs.close")}</Button>}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

type TFn = ReturnType<typeof useTranslation>["t"]

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  )
}

function LogDetail({ log, t }: { log: RequestLog; t: TFn }) {
  const none = t("admin.logs.none")
  return (
    <div className="flex flex-col gap-1.5">
      <DetailRow label={t("admin.logs.fieldId")} value={<span className="font-mono text-xs">{log.id}</span>} />
      <DetailRow
        label={t("admin.logs.fieldTraceId")}
        value={<span className="font-mono text-xs">{log.traceId}</span>}
      />
      <DetailRow
        label={t("admin.logs.fieldLevel")}
        value={
          <Badge variant={levelBadgeVariant(log.level)}>{log.level}</Badge>
        }
      />
      <DetailRow label={t("admin.logs.fieldMessage")} value={log.message || none} />
      <DetailRow label={t("admin.logs.fieldMethod")} value={log.method || none} />
      <DetailRow label={t("admin.logs.fieldPath")} value={log.path || none} />
      <DetailRow
        label={t("admin.logs.fieldStatus")}
        value={log.status ? log.status : none}
      />
      <DetailRow
        label={t("admin.logs.fieldLatency")}
        value={`${log.latencyMs} ms`}
      />
      <DetailRow label={t("admin.logs.fieldIp")} value={log.ip || none} />
      <DetailRow label={t("admin.logs.fieldUser")} value={log.userId || none} />
      <DetailRow
        label={t("admin.logs.fieldTime")}
        value={formatDateTime(log.createdAt)}
      />
      {log.attrs ? (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">
            {t("admin.logs.fieldAttrs")}
          </span>
          <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs">
            {log.attrs}
          </pre>
        </div>
      ) : null}
    </div>
  )
}

function CallChain({
  chain,
  activeId,
  t,
}: {
  chain: LogChain | null
  activeId: string
  t: TFn
}) {
  if (!chain || chain.items.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        {t("admin.logs.chainEmpty")}
      </div>
    )
  }

  return (
    <ol className="flex flex-col gap-0 border-l border-border pl-4">
      {chain.items.map((item) => {
        const active = item.id === activeId
        return (
          <li key={item.id} className="relative py-2">
            <span
              className="absolute -left-[21px] top-3.5 size-2 rounded-full"
              style={{
                backgroundColor: active
                  ? "var(--primary)"
                  : "var(--muted-foreground)",
              }}
            />
            <div className="flex items-center gap-2">
              <Badge variant={levelBadgeVariant(item.level)}>
                {item.level}
              </Badge>
              <span className={active ? "font-medium" : ""}>
                {item.message}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {formatDateTime(item.createdAt)}
              {item.status ? ` · ${item.status}` : ""}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
