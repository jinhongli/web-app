import {
  ALLOWED_REDIRECT_ORIGINS,
  LOGIN_ORIGIN,
} from "@workspace/auth/config"

/**
 * Whether `url` is a safe post-login redirect target: an absolute URL on one of
 * the known app origins, or a relative path. Anything else (other hosts,
 * protocol-relative, javascript:, …) is rejected to avoid open redirects.
 */
export function isAllowedRedirect(url: string): boolean {
  if (!url) return false
  // Relative path (but not protocol-relative "//evil.com").
  if (url.startsWith("/") && !url.startsWith("//")) return true
  try {
    const parsed = new URL(url)
    return ALLOWED_REDIRECT_ORIGINS.includes(parsed.origin)
  } catch {
    return false
  }
}

/**
 * Build the unified login URL (on the web app) that returns to `returnTo`
 * after a successful sign-in. `returnTo` should be the absolute URL of the
 * page the user is currently on.
 */
export function webLoginUrl(returnTo?: string): string {
  const login = new URL("/login", LOGIN_ORIGIN)
  if (returnTo && isAllowedRedirect(returnTo)) {
    login.searchParams.set("next", returnTo)
  }
  return login.toString()
}

/** The current page's absolute URL, or "" during SSR. */
export function currentUrl(): string {
  if (typeof window === "undefined") return ""
  return window.location.href
}
