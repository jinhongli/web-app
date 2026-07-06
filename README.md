# web-app

A typical full-stack web application — user registration/login, a public site,
an admin console, and API docs — built as a **pnpm + Turborepo monorepo** with
Next.js frontends and a Go backend.

## What's inside

- **Frontend**: Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn (Base UI) · Zustand · Zod · react-i18next
- **Backend**: Go 1.24 · Gin · GORM · PostgreSQL · JWT

```
apps/
  web/      public site — home, login, register, dashboard
  admin/    admin console — user management
  doc/      documentation — API reference + database schema
  server/   Go REST API — auth + users
packages/
  ui/ utils/ apis/ schemas/ auth/ i18n/    shared frontend libraries
  eslint-config/ typescript-config/
```

## Architecture at a glance

Three Next.js apps share code through workspace packages: `@workspace/schemas`
defines every data model once (zod + inferred types), `@workspace/apis` is the
typed HTTP client, `@workspace/ui` holds the component library, and
`@workspace/i18n` holds the en/zh copy (react-i18next). The Go backend is a
standalone module exposing a JSON REST API that follows the same contract.

See [docs/architecture.md](docs/architecture.md) for the full picture.

## Quick start

Prerequisites: Node 22, pnpm 10, Go 1.24.4, and PostgreSQL (a `webapp` database).

```bash
pnpm install
cp apps/server/.env.example apps/server/.env   # set DB DSN + JWT secret
pnpm dev                                        # run all apps (see startup logs for URLs)
```

Full setup, ports, and troubleshooting: [docs/development.md](docs/development.md).

## Developing

- Run one app: `pnpm --filter <web|admin|doc|server> dev`
- Check everything: `pnpm typecheck` · `pnpm lint` · `pnpm build`

Before contributing, read the guide for the area you're touching:

- [docs/architecture.md](docs/architecture.md) — layout, data flow, shared packages
- [docs/frontend.md](docs/frontend.md) — Next.js apps, UI library, state, conventions
- [docs/backend.md](docs/backend.md) — Go server: layering, auth, endpoints, config
- [docs/development.md](docs/development.md) — running, ports, database, troubleshooting

AI agents: start from [AGENTS.md](AGENTS.md).
