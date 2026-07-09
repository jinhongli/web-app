# Frontend

Three Next.js 16 apps (App Router, React 19, Turbopack) sharing UI, HTTP, and
schema packages. Styling is Tailwind v4 via `@workspace/ui`; components are
shadcn's Base UI variant; icons are `@tabler/icons-react`.

## Apps

### web (`apps/web`, :3520)

Public-facing site.

- `/` — landing page with links to sign in / register; signed-in visitors are
  redirected straight to `/dashboard`
- `/login`, `/register` — forms validated with `@workspace/schemas`, submitted
  through `@workspace/apis`; tokens saved to the shared auth store. This is the
  single SSO entry point for all three apps: after sign-in the form honors a
  `?next=<url>` param (validated by `isAllowedRedirect`) to return the visitor to
  the app they came from (both wrapped in `<Suspense>` for `useSearchParams`).
- `/dashboard` — authenticated dashboard (redirects to `/login` when signed
  out). Ported from shadcn's `dashboard-01` block: the offcanvas
  `AppSidebar` + `SiteHeader` shell now comes from `@workspace/views`
  (`app/dashboard/layout.tsx` holds the guard), with `SectionCards`, an
  interactive `recharts` area chart (`ChartAreaInteractive`), and a
  `@tanstack/react-table` + `@dnd-kit` data table (`DataTable`, drag-to-reorder /
  column visibility / pagination / row drawer). Dashboard-specific components live
  in `components/dashboard/`; framework copy goes through `@workspace/i18n` while
  the sample rows in `app/dashboard/data.json` stay hardcoded. The global settings
  menu is hidden on this route (`components/global-settings.tsx`) since the header
  carries its own controls.

### admin (`apps/admin`, :3521)

Admin console (restricted to the `admin` role). Renders the shared
`@workspace/views` sidebar + header shell (`components/app-shell.tsx` +
`components/app-sidebar.tsx`). `AppShell` is the auth gate: it bounces signed-out
visitors to the shared web login (`webLoginUrl(currentUrl())`), and renders an
"access required" screen for signed-in non-admins. The header carries the sidebar
trigger, a route breadcrumb (`components/page-breadcrumb.tsx`), and the
language/theme controls; sign-out lives in the sidebar footer's avatar dropdown
(clears the shared session, then redirects to the web login).

- `/` — signed-in home: an intro + section cards (like doc). Signed-out visitors
  are redirected to the web login by `AppShell`.
- `/users` — paginated user table; toggle a user's role via `PATCH /api/users/:id`.
  A `401` (expired/invalid session) clears the shared session and redirects to the
  web login.
- `/logs` — request-log explorer (`app/logs/logs-view.tsx`). Filters by keyword
  (matches message/path and exact log id / trace id), user (searchable
  `Combobox`), level, and date range (`Popover` + range `Calendar`); server-side
  paginated `@tanstack/react-table` (`manualPagination`) over `GET /api/logs`. A
  row's "view details" opens a `Drawer` showing the full entry plus its call
  chain — every log sharing that trace id, oldest first, from
  `GET /api/logs/:id/chain`.

### doc (`apps/doc`, :3522)

Documentation site. Renders the shared `@workspace/views` sidebar + header shell
(`components/app-sidebar.tsx` supplies two-level collapsible nav groups) wrapped
in `components/app-shell.tsx`, which hides the chrome on the signed-out landing
home and redirects protected routes to the shared web login when signed out. The
header carries the sidebar trigger, a route breadcrumb
(`components/page-breadcrumb.tsx`), and the language/theme controls. Page modules
are extracted into reusable components (`components/schema-modules.tsx`,
`components/api-reference.tsx`) so each route renders one module, and each page's
title matches its nav leaf.

- `/` — public home: landing hero with a sign-in button when signed out, or the
  section-card overview when signed in
- `/schema` — ER diagram (submenu: Database Schema › ER Diagram)
- `/schema/users` — users table + indexes (Database Schema › Users)
- `/api/auth` — auth endpoints (API Reference › Auth)
- `/api/users` — users endpoints (API Reference › Users)

## Shared packages

### @workspace/ui

shadcn components (Base UI) under `src/components`, `cn()` in `src/lib/utils.ts`,
Tailwind v4 theme in `src/styles/globals.css`. Apps import via
`@workspace/ui/components/<name>` and `@workspace/ui/globals.css`. The full
shadcn `base-mira` (Base UI) component set is installed here.

Re-sync or add components with the shadcn CLI from an app directory:

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>   # or: add --all
```

The CLI writes to `packages/ui` and fixes imports. Keep `style`, `baseColor`,
and `iconLibrary` consistent across each app's `components.json`.

**Base UI is not Radix.** Use the `render` prop instead of `asChild`. When a
button renders a non-`<button>` (e.g. a `next/link` anchor), pass
`nativeButton={false}`:

```tsx
<Button nativeButton={false} render={<Link href="/login">Sign in</Link>} />
```

#### Sidebar

`@workspace/ui/components/sidebar` is a Base UI port of shadcn's collapsible
sidebar (the stock component depends on Radix, so it was rebuilt on Base UI
`Tooltip`/`Dialog`/`useRender`). Wrap the app in `SidebarProvider`, then compose
`Sidebar` (`variant="inset"`, `collapsible="icon"`) with
`SidebarHeader`/`SidebarContent`/`SidebarFooter`, `SidebarMenu`/`SidebarMenuItem`
/`SidebarMenuButton`, and put page content in `SidebarInset`. `SidebarTrigger`
toggles it (also `Cmd/Ctrl+B`); collapsed state persists in the `sidebar_state`
cookie. On mobile (`useIsMobile`, `src/hooks/use-mobile.ts`) it becomes a
`Dialog` drawer. `SidebarMenuButton` renders as a `next/link` via `render` and
shows its label in a tooltip when collapsed. For nested navigation, wrap items
in `SidebarMenuCollapsible` / `SidebarMenuCollapsibleTrigger` /
`SidebarMenuCollapsiblePanel` (a thin wrapper over Base UI `Collapsible`, so
apps don't import Base UI directly) with `SidebarMenuSub`/`SidebarMenuSubItem`/
`SidebarMenuSubButton` inside. `SidebarMenuAction` renders a hover/focus action
button (e.g. a row's `⋯` menu trigger) positioned inside a `SidebarMenuItem`.
All three apps compose the sidebar (and the header) through the higher-level
`@workspace/views` package rather than assembling these primitives directly.

### @workspace/views

Shared app-shell views so web / admin / doc render the **same sidebar and header
layout** (styled after web's dashboard, `collapsible="offcanvas"`) while each app
supplies its own content. Exports:

- `AppSidebar` — brand header + body + `NavUser` footer. Driven by props: a
  `link` component (each app passes its `next/link`), a `brand`, a `user` (avatar
  dropdown with an optional menu + a sign-out handler), and `sections`. A section
  is either flat `links` or nested collapsible `groups` (doc's two-level nav);
  `topContent` and a per-item `action` slot cover web's quick-create CTA and
  document row-action menus.
- `SiteHeader` — sidebar trigger + separator + a `title` or `children` slot (apps
  pass a breadcrumb) + the language/theme menus.
- `NavUser` — the avatar dropdown used in the footer.

Copy is **not** resolved here: apps pass already-translated strings (so `views`
doesn't depend on `@workspace/i18n` keys). Each app's thin
`components/app-sidebar.tsx` maps its i18n keys + nav config onto these props;
web additionally wraps `SiteHeader` in `components/dashboard/site-header.tsx`.

### @workspace/auth

The shared SSO session. Exports a single cookie-persisted zustand `useAuthStore`
(so web / admin / doc read the same session — see
[architecture.md](architecture.md)), the origin/cookie `config`, and URL helpers
(`webLoginUrl`, `currentUrl`, `isAllowedRedirect`). Apps re-export the store from
their `lib/auth-store.ts` and import the helpers directly from `@workspace/auth`.

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

`@workspace/ui/components/settings-menu` exports three controls over the shared
language + color-mode state (`next-themes`):

- `SettingsMenu` — one icon button opening a combined language + theme menu; used
  by web (fixed top-right, hidden on `/dashboard`).
- `LanguageMenu` — icon-only button opening just the language picker
  (English / 中文).
- `ThemeMenu` — icon-only button that cycles light → dark → system on click, with
  the icon reflecting the current mode (sun / moon-stars / brightness).

admin and doc place `LanguageMenu` + `ThemeMenu` at the right of the inset
header, as does web's `/dashboard` (`components/dashboard/site-header.tsx`).

## State management

Auth state lives in one shared zustand store, `@workspace/auth`, persisted to a
**cookie** (not localStorage) so a single session is shared across all three
apps — this is what makes SSO work. Each app re-exports it verbatim:

- `apps/web/lib/auth-store.ts`
- `apps/admin/lib/auth-store.ts`
- `apps/doc/lib/auth-store.ts`

all just `export { useAuthStore } from "@workspace/auth"`. See
[architecture.md](architecture.md) for the SSO flow and cookie/config details.

The store holds `user` + `tokens` with `setAuth` / `setTokens` / `clear`.
Protected pages read the store on the client; when empty they redirect to the
shared web login via `webLoginUrl(currentUrl())`, which returns the visitor to
their origin after sign-in.

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
pnpm --filter web dev      # :3520
pnpm --filter admin dev    # :3521
pnpm --filter doc dev      # :3522
```

Point the frontends at a running backend with
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`. Dev servers auto-fall back to
the next free port if the default is taken.

SSO needs each app to know the others' public origins. The defaults match the
dev ports, so no config is required locally; override via
`NEXT_PUBLIC_{WEB,ADMIN,DOC}_URL` and the cookie
(`NEXT_PUBLIC_AUTH_COOKIE_NAME` / `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`) in production.
See each app's `.env.example` and [architecture.md](architecture.md).
