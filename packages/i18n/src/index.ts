export { useTranslation, Trans } from "react-i18next"
export type { ParseKeys as TranslationKey } from "i18next"

export {
  locales,
  defaultLocale,
  localeNames,
  isLocale,
  type Locale,
} from "./locales"

export { messages, resources, defaultNS, type Messages } from "./messages"
export { en } from "./messages/en"
export { createI18n, readStoredLocale, languageStorageKey } from "./config"
export { I18nProvider, setLocale } from "./provider"

import type { defaultNS as DefaultNS } from "./messages"
import type { en } from "./messages/en"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof DefaultNS
    resources: { translation: typeof en }
  }
}
