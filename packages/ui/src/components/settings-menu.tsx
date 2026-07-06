"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { IconCheck, IconSettings } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { setLocale, useTranslation, type Locale } from "@workspace/i18n"

import { Button } from "@workspace/ui/components/button"

const popupClassName =
  "min-w-44 origin-[var(--transform-origin)] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none"

const groupLabelClassName =
  "px-2 py-1 text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase"

const radioItemClassName =
  "flex cursor-default items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-xs outline-none select-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground"

const themeValues = ["light", "dark", "system"] as const

export function SettingsMenu({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentLocale = (i18n.resolvedLanguage ?? i18n.language) as Locale
  const currentTheme = mounted ? (theme ?? "system") : undefined

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("settings.label")}
            className={className}
          >
            <IconSettings />
          </Button>
        }
      />
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end" className="z-50">
          <Menu.Popup className={popupClassName}>
            <Menu.Group>
              <Menu.GroupLabel className={groupLabelClassName}>
                {t("settings.language")}
              </Menu.GroupLabel>
              <Menu.RadioGroup
                value={currentLocale}
                onValueChange={(value) => setLocale(value as Locale)}
              >
                <Menu.RadioItem value="en" className={radioItemClassName}>
                  {t("settings.english")}
                  <Menu.RadioItemIndicator>
                    <IconCheck className="size-3.5" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
                <Menu.RadioItem value="zh" className={radioItemClassName}>
                  {t("settings.chinese")}
                  <Menu.RadioItemIndicator>
                    <IconCheck className="size-3.5" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              </Menu.RadioGroup>
            </Menu.Group>

            <Menu.Separator className="my-1 h-px bg-border" />

            <Menu.Group>
              <Menu.GroupLabel className={groupLabelClassName}>
                {t("settings.theme")}
              </Menu.GroupLabel>
              <Menu.RadioGroup
                value={currentTheme}
                onValueChange={(value) => setTheme(value as string)}
              >
                {themeValues.map((value) => (
                  <Menu.RadioItem
                    key={value}
                    value={value}
                    className={radioItemClassName}
                  >
                    {t(`settings.${value}`)}
                    <Menu.RadioItemIndicator>
                      <IconCheck className="size-3.5" />
                    </Menu.RadioItemIndicator>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
