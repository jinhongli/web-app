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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

type Column = {
  name: string
  type: string
  constraints: string
  noteKey: TranslationKey
}

type TableDef = {
  name: string
  descriptionKey: TranslationKey
  columns: Column[]
  indexes: string[]
}

const usersTable: TableDef = {
  name: "users",
  descriptionKey: "doc.schema.usersDescription",
  columns: [
    { name: "id", type: "uuid", constraints: "PK", noteKey: "doc.schema.noteId" },
    { name: "email", type: "text", constraints: "NOT NULL · UNIQUE", noteKey: "doc.schema.noteEmail" },
    { name: "name", type: "text", constraints: "NOT NULL", noteKey: "doc.schema.noteName" },
    { name: "password_hash", type: "text", constraints: "NOT NULL", noteKey: "doc.schema.notePasswordHash" },
    { name: "role", type: "varchar(16)", constraints: "NOT NULL · default 'user'", noteKey: "doc.schema.noteRole" },
    { name: "created_at", type: "timestamptz", constraints: "", noteKey: "doc.schema.noteCreatedAt" },
    { name: "updated_at", type: "timestamptz", constraints: "", noteKey: "doc.schema.noteUpdatedAt" },
    { name: "deleted_at", type: "timestamptz", constraints: "INDEX", noteKey: "doc.schema.noteDeletedAt" },
  ],
  indexes: [
    "users_pkey — PRIMARY KEY (id)",
    "idx_users_email — UNIQUE (email)",
    "idx_users_deleted_at — (deleted_at)",
  ],
}

function EntityDiagram() {
  return (
    <svg
      viewBox="0 0 340 300"
      className="h-auto w-full max-w-sm text-foreground"
      role="img"
      aria-label="Entity relationship diagram for the users table"
    >
      <rect
        x="70"
        y="20"
        width="200"
        height="260"
        rx="8"
        className="fill-card stroke-border"
        strokeWidth="1"
      />
      <rect
        x="70"
        y="20"
        width="200"
        height="34"
        rx="8"
        className="fill-muted stroke-border"
        strokeWidth="1"
      />
      <text x="170" y="42" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">
        users
      </text>
      {[
        { key: "id", type: "uuid PK", y: 78 },
        { key: "email", type: "text U", y: 104 },
        { key: "name", type: "text", y: 130 },
        { key: "password_hash", type: "text", y: 156 },
        { key: "role", type: "varchar", y: 182 },
        { key: "created_at", type: "ts", y: 208 },
        { key: "updated_at", type: "ts", y: 234 },
        { key: "deleted_at", type: "ts", y: 260 },
      ].map((row) => (
        <g key={row.key}>
          <text x="84" y={row.y} className="fill-foreground font-mono text-[11px]">
            {row.key}
          </text>
          <text x="256" y={row.y} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
            {row.type}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function SchemaErSection() {
  const { t } = useTranslation()

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("doc.schema.erTitle")}</CardTitle>
        <CardDescription>{t("doc.schema.erDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <EntityDiagram />
      </CardContent>
    </Card>
  )
}

export function SchemaUsersSection() {
  const { t } = useTranslation()
  const table = usersTable

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="font-heading font-mono text-sm font-medium">{table.name}</h2>
        <Badge variant="outline">{t("doc.schema.tableBadge")}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{t(table.descriptionKey)}</p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("doc.schema.colColumn")}</TableHead>
            <TableHead>{t("doc.schema.colType")}</TableHead>
            <TableHead>{t("doc.schema.colConstraints")}</TableHead>
            <TableHead>{t("doc.schema.colNotes")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.columns.map((column) => (
            <TableRow key={column.name}>
              <TableCell className="font-mono">{column.name}</TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {column.type}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {column.constraints || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {t(column.noteKey)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-medium">{t("doc.schema.indexesTitle")}</h3>
        <ul className="flex flex-col gap-0.5">
          {table.indexes.map((index) => (
            <li key={index} className="font-mono text-xs text-muted-foreground">
              {index}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
