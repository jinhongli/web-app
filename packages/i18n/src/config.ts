import i18next, { type i18n as I18nInstance } from "i18next"
import { initReactI18next } from "react-i18next"

import { defaultLocale, isLocale, locales, type Locale } from "./locales"
import { defaultNS, resources } from "./messages"

export const languageStorageKey = "app-locale"

/** Read the persisted locale from localStorage, falling back to the default. */
export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale
  const stored = window.localStorage.getItem(languageStorageKey)
  return stored && isLocale(stored) ? stored : defaultLocale
}

/**
 * Create a fresh i18next instance bound to the react-i18next backend. Each app
 * gets its own instance seeded with the same shared resources.
 */
export function createI18n(locale: Locale): I18nInstance {
  const instance = i18next.createInstance()

  void instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: locales,
    defaultNS,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

  return instance
}
