# Frontend

Three Next.js 16 apps (App Router, React 19, Turbopack) sharing UI, HTTP, and
schema packages. Styling is Tailwind v4 via `@workspace/ui`; components are
shadcn's Base UI variant; icons are `@tabler/icons-react`.

## Apps

### web (`apps/web`, :3000)

Public-facing site.

- `/` — landing page with links to sign in / register
- `/login`, `/register` — forms validated with `@workspace/schemas`, submitted
  through `@workspace/apis`; tokens saved to the auth store
- `/dashboard` — authenticated view; redirects to `/login` when signed out

### admin (`apps/admin`, :3001)

Admin console (login restricted to `admin` role).

- `/` — redirects to `/users`
- `/login` — rejects non-admin accounts
- `/users` — paginated user table; toggle a user's role via `PATCH /api/users/:id`

### doc (`apps/doc`, :3002)

Static documentation site with a shared top nav (`components/site-nav.tsx`).

- `/` — API reference (endpoint cards)
- `/schema` — database schema table + inline SVG ER diagram

## Shared packages

### @workspace/ui

shadcn components (Base UI) under `src/components`, `cn()` in `src/lib/utils.ts`,
Tailwind v4 theme in `src/styles/globals.css`. Apps import via
`@workspace/ui/components/<name>` and `@workspace/ui/globals.css`.

Add components with the shadcn CLI from an app directory:

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>
```

The CLI writes to `packages/ui` and fixes imports. Keep `style`, `baseColor`,
and `iconLibrary` consistent across each app's `components.json`.

**Base UI is not Radix.** Use the `render` prop instead of `asChild`. When a
button renders a non-`<button>` (e.g. a `next/link` anchor), pass
`nativeButton={false}`:

```tsx
<Button nativeButton={false} render={<Link href="/login">Sign in</Link>} />
```

### @workspace/schemas

Single source of truth for data models — zod schemas with `z.infer` types.
Import types here rather than redeclaring them (`import type { User } from
"@workspace/schemas"`).

### @workspace/apis

Typed `fetch` wrapper (`apiFetch`) that validates every response against a
schema and throws `ApiRequestError` on failure. Base URL comes from
`NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`). Add new endpoints
here (`auth.ts`, `users.ts`) instead of calling `fetch` in components.

### @workspace/utils

Framework-agnostic helpers: `formatDateTime`, `truncate`, `invariant`.

### @workspace/i18n

All user-facing copy for the frontends, in English and Chinese, served through
**react-i18next**. `en` is the type base; `zh` must match its shape. Read a
string with the `useTranslation` hook:

```tsx
"use client"
import { useTranslation } from "@workspace/i18n"

function Title() {
  const { t } = useTranslation()
  return <h1>{t("web.login.title")}</h1> // "登录" when locale is zh
}
```

`t` keys are dot paths into the catalog and are autocompleted/typechecked (the
package augments i18next's `CustomTypeOptions`). Interpolate with the `{{name}}`
syntax: `t("admin.users.updated", { name })`. For a key stored in a variable,
type it as `TranslationKey`.

Add new copy to `packages/i18n/src/messages/en.ts` first — typecheck then forces
the matching `zh` entry. Supported locales live in `src/locales.ts`.

Each app wraps its tree with `I18nProvider` (from `@workspace/i18n/provider`)
inside the theme provider. The provider restores the locale persisted in
localStorage (`app-locale`) and keeps `<html lang>` in sync.

### Language & theme switcher

`@workspace/ui/components/settings-menu` exports `SettingsMenu`, a shared
top-right control combining the language picker (English / 中文) with the color
mode (light / dark / system, via `next-themes`). web and admin mount it fixed in
the top-right corner; doc places it in the site nav.

## State management

Auth state uses a zustand store persisted to localStorage, one per app:

- `apps/web/lib/auth-store.ts` — persist key `web-auth`
- `apps/admin/lib/auth-store.ts` — persist key `admin-auth`

It holds `user` + `tokens` with `setAuth` / `setTokens` / `clear`. Protected
pages read the store on the client and redirect to `/login` when empty.

## Conventions

- Forms validate with a zod schema before calling `@workspace/apis`; surface
  errors with the `sonner` toast (`toast` re-exported from
  `@workspace/ui/components/sonner`).
- Shared packages compile under Bundler module resolution, so their relative
  imports omit file extensions. Each app lists workspace packages in
  `transpilePackages` (`next.config.ts`).
- New Next.js 16 has breaking changes vs. older versions — consult
  `node_modules/next/dist/docs/` before writing framework code (see AGENTS.md).

## Running

```bash
pnpm --filter web dev      # :3000
pnpm --filter admin dev    # :3001
pnpm --filter doc dev      # :3002
```

Point the frontends at a running backend with
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`. Dev servers auto-fall back to
the next free port if the default is taken.
