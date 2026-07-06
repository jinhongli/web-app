"use client"

import { useTranslation } from "@workspace/i18n"
import { SiteHeader as ViewsSiteHeader } from "@workspace/views/site-header"

export function SiteHeader() {
  const { t } = useTranslation()
  return <ViewsSiteHeader title={t("web.dashboard.headerTitle")} />
}
