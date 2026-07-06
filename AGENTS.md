<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Repository guide for agents

A pnpm + Turborepo monorepo for a typical full-stack web app: three Next.js
frontends (`apps/web`, `apps/admin`, `apps/doc`) and a Go + Gin backend
(`apps/server`), with shared TypeScript packages under `packages/`.

Read the [README](README.md) for the overview, then the relevant guide in
[`docs/`](docs/) before changing code — **all detail lives in `docs/`**.

## Where to look

| Task                                              | Read                                         |
| ------------------------------------------------- | -------------------------------------------- |
| Layout, data flow, shared packages                | [docs/architecture.md](docs/architecture.md) |
| Go backend — layering, auth, endpoints, config    | [docs/backend.md](docs/backend.md)           |
| A frontend — apps, UI library, state, conventions | [docs/frontend.md](docs/frontend.md)         |
| Running, configuring, or troubleshooting locally  | [docs/development.md](docs/development.md)   |

## Before editing

- Follow the existing conventions; don't introduce parallel patterns. The key
  ones (schemas as the single source of truth, HTTP via `@workspace/apis`, UI in
  `@workspace/ui`, copy via `@workspace/i18n` / react-i18next, Base UI ≠ Radix,
  the auth store, module resolution) are described in
  [docs/architecture.md](docs/architecture.md) and
  [docs/frontend.md](docs/frontend.md).
- The backend needs Go 1.24.4 (not on PATH by default) and a running PostgreSQL —
  see [docs/backend.md](docs/backend.md) and [docs/development.md](docs/development.md).
- Next.js here is a new major with breaking changes — see the note above.

## Verifying changes

- `pnpm typecheck` (includes the Go build) and `pnpm lint` from the repo root.
- Frontend changes: run the app and check it in a browser — types don't prove UI
  correctness.
- Backend changes: `curl` the endpoints; `GET /healthz` returns `{"status":"ok"}`.

Commands and details: [docs/development.md](docs/development.md).

## Keeping docs in sync

When a change touches the technical architecture, directory/workspace structure,
shared-package boundaries, tech stack, data flow, endpoints, config, or ports —
anything the repository docs describe — update the relevant doc in the same
change. Keep [README.md](README.md) and this file as overview/navigation only;
put the detail in the matching [`docs/`](docs/) guide (see the table above). A
change is not complete until the docs match the code.
