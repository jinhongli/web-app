export { useAuthStore } from "@workspace/auth/store"
export {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_DOMAIN,
  WEB_URL,
  ADMIN_URL,
  DOC_URL,
  LOGIN_ORIGIN,
  ALLOWED_REDIRECT_ORIGINS,
} from "@workspace/auth/config"
export { isAllowedRedirect, webLoginUrl, currentUrl } from "@workspace/auth/urls"
