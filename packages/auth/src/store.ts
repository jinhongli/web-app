"use client"

import type { Tokens, User } from "@workspace/schemas"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { AUTH_COOKIE_DOMAIN, AUTH_COOKIE_NAME } from "@workspace/auth/config"

interface AuthState {
  user: User | null
  tokens: Tokens | null
  setAuth: (user: User, tokens: Tokens) => void
  setTokens: (tokens: Tokens) => void
  clear: () => void
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const target = `${encodeURIComponent(name)}=`
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length))
    }
  }
  return null
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  const domain = AUTH_COOKIE_DOMAIN ? `; Domain=${AUTH_COOKIE_DOMAIN}` : ""
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${domain}${secure}`
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  const domain = AUTH_COOKIE_DOMAIN ? `; Domain=${AUTH_COOKIE_DOMAIN}` : ""
  document.cookie =
    `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax${domain}`
}

/**
 * A minimal `Storage`-like object backed by a shared cookie. The cookie is
 * visible to every app on the same host/parent domain, so the session set by
 * one app is picked up by the others on their next load — this is what makes
 * SSO work across the web / admin / doc apps.
 */
const cookieStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = {
  getItem: (name) => readCookie(name),
  setItem: (name, value) => writeCookie(name, value),
  removeItem: (name) => deleteCookie(name),
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => set({ user, tokens }),
      setTokens: (tokens) => set({ tokens }),
      clear: () => set({ user: null, tokens: null }),
    }),
    {
      name: AUTH_COOKIE_NAME,
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    }
  )
)
