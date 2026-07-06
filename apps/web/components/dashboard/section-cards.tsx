"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useTranslation } from "@workspace/i18n"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export function SectionCards() {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("web.dashboard.cards.totalRevenue")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("web.dashboard.cards.totalRevenueTrend")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("web.dashboard.cards.totalRevenueFooter")}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("web.dashboard.cards.newCustomers")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("web.dashboard.cards.newCustomersTrend")}{" "}
            <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("web.dashboard.cards.newCustomersFooter")}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("web.dashboard.cards.activeAccounts")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("web.dashboard.cards.activeAccountsTrend")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("web.dashboard.cards.activeAccountsFooter")}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("web.dashboard.cards.growthRate")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("web.dashboard.cards.growthRateTrend")}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("web.dashboard.cards.growthRateFooter")}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
