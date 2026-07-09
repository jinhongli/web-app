/**
 * Shared SSO configuration for the web / admin / doc apps.
 *
 * All three apps read one session from a cookie. Because browser cookies are
 * keyed by host (not port), a cookie set on `localhost` is shared across
 * `localhost:3520` (web), `:3521` (admin), and `:3522` (doc) in development.
 * In production the apps live on sibling subdomains, so the cookie is scoped to
 * the shared parent domain via `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`.
 *
 * These are `NEXT_PUBLIC_*` values so they are inlined into the client bundle.
 */

export const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "webapp_sso"

/**
 * The parent domain the session cookie is scoped to (e.g. `.example.com`).
 * Leave unset in development so the cookie defaults to the current host,
 * which `localhost` shares across ports.
 */
export const AUTH_COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN || undefined

/** Public origins of each app, used to build cross-app redirect URLs. */
export const WEB_URL =
  process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3520"
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3521"
export const DOC_URL =
  process.env.NEXT_PUBLIC_DOC_URL ?? "http://localhost:3522"

/** The app that owns the login screen — the single SSO entry point. */
export const LOGIN_ORIGIN = WEB_URL

/** Origins allowed as post-login redirect targets. */
export const ALLOWED_REDIRECT_ORIGINS = [WEB_URL, ADMIN_URL, DOC_URL]
