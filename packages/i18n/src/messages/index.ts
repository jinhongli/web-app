import type { Locale } from "../locales"

import { en, type Messages } from "./en"
import { zh } from "./zh"

export type { Messages }

export const defaultNS = "translation" as const

export const messages: Record<Locale, Messages> = {
  en,
  zh,
}

/** react-i18next resource bundle: one namespace ("translation") per locale. */
export const resources = {
  en: { translation: en },
  zh: { translation: zh },
} as const
