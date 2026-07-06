# Architecture

A pnpm + Turborepo monorepo containing three Next.js frontends and one Go
backend, plus shared TypeScript packages.

## Workspace layout

```
apps/
  web/      Next.js — public site (home, login, register, dashboard)
  admin/    Next.js — admin console (user management)
  doc/      Next.js — API reference + database schema docs
  server/   Go + Gin — auth + user REST API
packages/
  ui/                 @workspace/ui        shadcn (Base UI) component library
  utils/              @workspace/utils     framework-agnostic helpers
  apis/               @workspace/apis      typed HTTP client
  schemas/            @workspace/schemas   zod schemas + inferred types
  i18n/               @workspace/i18n      en/zh catalogs via react-i18next
  eslint-config/      @workspace/eslint-config      shared flat ESLint config
  typescript-config/  @workspace/typescript-config  shared tsconfig presets
```

Workspaces are declared in `pnpm-workspace.yaml` (`apps/*`, `packages/*`) and
orchestrated by `turbo.json`. The root `package.json` proxies `dev`, `build`,
`lint`, `typecheck`, and `format` to `turbo run <task>`.

## Dependency direction

```
apps/web ─┐
apps/admin├─▶ @workspace/apis ─▶ @workspace/schemas
apps/doc ─┘        │
                   ├─▶ @workspace/ui ─▶ @workspace/i18n
                   ├─▶ @workspace/i18n
                   └─▶ @workspace/utils
apps/server (Go)  — independent module, no JS deps
```

- Frontends depend on shared packages; shared packages never depend on apps.
- `@workspace/apis` depends on `@workspace/schemas` (to validate payloads).
- `@workspace/ui` depends on `@workspace/i18n` (the shared `SettingsMenu` reads
  translations), and `@workspace/i18n` is the only package that pulls in
  `i18next`/`react-i18next`, so everything shares one React context.
- The Go backend is a standalone Go module; it shares no code with the JS side,
  only the HTTP contract.

## The contract: schemas as the single source of truth

`@workspace/schemas` defines every data model once with zod, and derives the
TypeScript types via `z.infer`:

- `common.ts` — API error envelope, pagination, generic `paginated<T>()`
- `user.ts` — `userSchema`, `userRoleSchema`, `updateUserSchema`
- `auth.ts` — `loginSchema`, `registerSchema`, `tokensSchema`, `authResultSchema`

`@workspace/apis` imports these schemas and validates responses at runtime, so
callers always get typed, verified data. The Go backend's DTOs
(`apps/server/internal/handler/dto.go`) are hand-written to match the same JSON
shape (camelCase field names, RFC3339 timestamps).

## Localization: one catalog per locale

`@workspace/i18n` holds all user-facing copy for every frontend and drives it
through **react-i18next**. Copy is keyed by namespace (`settings`, `common`,
`web.*`, `admin.*`, `doc.*`):

- `src/locales.ts` — the supported `locales` (`en`, `zh`), `defaultLocale`, and
  `localeNames`.
- `src/messages/en.ts` — the English catalog; its shape is the `Messages` type
  that every other locale must satisfy.
- `src/messages/zh.ts` — the Chinese catalog, typed as `Messages` so a missing
  or extra key fails typecheck.
- `src/messages/index.ts` — assembles the react-i18next `resources` bundle.
- `src/config.ts` — `createI18n(locale)` builds an i18next instance; also reads
  the persisted locale from localStorage.
- `src/provider.tsx` — `I18nProvider`, the client boundary that shares one
  i18next instance across an app and syncs `<html lang>`.
- `src/index.ts` — re-exports `useTranslation`/`Trans`, augments i18next's
  `CustomTypeOptions` for typed dot-path keys, and exposes `TranslationKey`.

Because the English catalog is the type source, adding a string there forces a
matching entry in every other locale — the same single-source-of-truth pattern
`@workspace/schemas` uses for data models. Only this package depends on
`i18next`/`react-i18next`, so every app and `@workspace/ui` share one React
context.

## Request lifecycle (example: login)

1. `apps/web` login form validates input with `loginSchema` (zod).
2. It calls `login()` from `@workspace/apis`, which POSTs to
   `/api/auth/login` and parses the response with `authResultSchema`.
3. The Go server authenticates, signs a JWT access/refresh pair, and returns
   `{ user, tokens }`.
4. The app stores the result in a persisted zustand store and routes to the
   dashboard.

## Build system

- **Turborepo** runs tasks across workspaces with caching. `build` depends on
  upstream builds (`^build`); `dev` is persistent and uncached.
- The **Go server participates in Turbo** via its `package.json`, whose scripts
  wrap `go` commands (and prepend the Go SDK to PATH). So `pnpm dev` /
  `pnpm build` / `pnpm typecheck` cover the backend too.

See [backend.md](backend.md) and [frontend.md](frontend.md) for per-side detail,
and [development.md](development.md) for running everything locally.
