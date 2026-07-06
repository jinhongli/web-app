"use client"

import * as React from "react"
import { I18nextProvider } from "react-i18next"

import { createI18n, languageStorageKey, readStoredLocale } from "./config"
import { defaultLocale, type Locale } from "./locales"

const [instance] = [createI18n(defaultLocale)]

/**
 * Wraps an app subtree with a shared i18next instance. On mount it applies the
 * locale persisted in localStorage so the choice survives reloads, and keeps
 * `<html lang>` in sync with the active language.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const stored = readStoredLocale()
    if (stored !== instance.language) {
      void instance.changeLanguage(stored)
    }

    const onChange = (lng: string) => {
      document.documentElement.lang = lng
      window.localStorage.setItem(languageStorageKey, lng)
    }

    instance.on("languageChanged", onChange)
    document.documentElement.lang = instance.language
    return () => {
      instance.off("languageChanged", onChange)
    }
  }, [])

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}

export function setLocale(locale: Locale) {
  void instance.changeLanguage(locale)
}
