"use client"

import {
  IconApps,
  IconDatabase,
  IconPackages,
  IconServer,
} from "@tabler/icons-react"
import { useTranslation, type TranslationKey } from "@workspace/i18n"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type Block = {
  icon: typeof IconApps
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

const blocks: Block[] = [
  {
    icon: IconApps,
    titleKey: "doc.architecture.layerAppsTitle",
    bodyKey: "doc.architecture.layerAppsBody",
  },
  {
    icon: IconPackages,
    titleKey: "doc.architecture.layerPackagesTitle",
    bodyKey: "doc.architecture.layerPackagesBody",
  },
  {
    icon: IconServer,
    titleKey: "doc.architecture.layerServerTitle",
    bodyKey: "doc.architecture.layerServerBody",
  },
  {
    icon: IconDatabase,
    titleKey: "doc.architecture.layerDataTitle",
    bodyKey: "doc.architecture.layerDataBody",
  },
]

type Concept = {
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

const concepts: Concept[] = [
  {
    titleKey: "doc.architecture.conceptContractTitle",
    bodyKey: "doc.architecture.conceptContractBody",
  },
  {
    titleKey: "doc.architecture.conceptSsoTitle",
    bodyKey: "doc.architecture.conceptSsoBody",
  },
  {
    titleKey: "doc.architecture.conceptRolesTitle",
    bodyKey: "doc.architecture.conceptRolesBody",
  },
  {
    titleKey: "doc.architecture.conceptI18nTitle",
    bodyKey: "doc.architecture.conceptI18nBody",
  },
  {
    titleKey: "doc.architecture.conceptBuildTitle",
    bodyKey: "doc.architecture.conceptBuildBody",
  },
]

const flowSteps: TranslationKey[] = [
  "doc.architecture.flowStep1",
  "doc.architecture.flowStep2",
  "doc.architecture.flowStep3",
  "doc.architecture.flowStep4",
]

// A static, theme-aware diagram of the layers and their dependency/data flow:
// three frontends → shared packages → Go API → PostgreSQL.
function SystemDiagram() {
  return (
    <svg
      viewBox="0 0 620 300"
      className="h-auto w-full text-foreground"
      role="img"
      aria-label="System architecture diagram: three Next.js frontends depend on shared packages and call the Go API, which persists to PostgreSQL"
    >
      <defs>
        <marker
          id="arch-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
        </marker>
      </defs>

      {/* Frontends column */}
      {[
        { label: "web", sub: ":3520", y: 24 },
        { label: "admin", sub: ":3521", y: 96 },
        { label: "doc", sub: ":3522", y: 168 },
      ].map((app) => (
        <g key={app.label}>
          <rect
            x="16"
            y={app.y}
            width="120"
            height="56"
            rx="8"
            className="fill-card stroke-border"
            strokeWidth="1"
          />
          <text
            x="76"
            y={app.y + 26}
            textAnchor="middle"
            className="fill-foreground text-[13px] font-semibold"
          >
            {app.label}
          </text>
          <text
            x="76"
            y={app.y + 42}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {app.sub}
          </text>
          {/* app → shared packages */}
          <line
            x1="136"
            y1={app.y + 28}
            x2="220"
            y2="128"
            className="stroke-muted-foreground"
            strokeWidth="1"
            markerEnd="url(#arch-arrow)"
          />
        </g>
      ))}

      {/* Shared packages */}
      <rect
        x="222"
        y="72"
        width="150"
        height="112"
        rx="8"
        className="fill-muted stroke-border"
        strokeWidth="1"
      />
      <text
        x="297"
        y="98"
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        shared packages
      </text>
      {["apis · schemas", "ui · views", "auth · i18n · utils"].map(
        (line, i) => (
          <text
            key={line}
            x="297"
            y={120 + i * 18}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {line}
          </text>
        )
      )}

      {/* packages → Go API */}
      <line
        x1="372"
        y1="128"
        x2="452"
        y2="128"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#arch-arrow)"
      />

      {/* Go backend */}
      <rect
        x="454"
        y="96"
        width="150"
        height="64"
        rx="8"
        className="fill-card stroke-border"
        strokeWidth="1"
      />
      <text
        x="529"
        y="124"
        textAnchor="middle"
        className="fill-foreground text-[13px] font-semibold"
      >
        Go + Gin API
      </text>
      <text
        x="529"
        y="142"
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[10px]"
      >
        :3528
      </text>

      {/* Go API → PostgreSQL */}
      <line
        x1="529"
        y1="160"
        x2="529"
        y2="236"
        className="stroke-muted-foreground"
        strokeWidth="1"
        markerEnd="url(#arch-arrow)"
      />

      {/* PostgreSQL */}
      <rect
        x="454"
        y="238"
        width="150"
        height="48"
        rx="8"
        className="fill-muted stroke-border"
        strokeWidth="1"
      />
      <text
        x="529"
        y="267"
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        PostgreSQL
      </text>
    </svg>
  )
}

export function ArchitectureOverview() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-sm font-medium">
          {t("doc.architecture.overviewTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("doc.architecture.overviewBody")}
        </p>
      </section>

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("doc.architecture.diagramTitle")}</CardTitle>
          <CardDescription>
            {t("doc.architecture.diagramDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemDiagram />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-medium">
          {t("doc.architecture.layersTitle")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {blocks.map((block) => (
            <Card key={block.titleKey} size="sm" className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <block.icon className="size-4" />
                  {t(block.titleKey)}
                </CardTitle>
                <CardDescription>{t(block.bodyKey)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-medium">
          {t("doc.architecture.conceptsTitle")}
        </h2>
        <div className="flex flex-col gap-3">
          {concepts.map((concept) => (
            <div key={concept.titleKey} className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t(concept.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">
                {t(concept.bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-medium">
          {t("doc.architecture.flowTitle")}
        </h2>
        <ol className="flex flex-col gap-2">
          {flowSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 font-mono">
                {index + 1}
              </Badge>
              <span className="text-sm text-muted-foreground">{t(step)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
