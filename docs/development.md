# Development

## Prerequisites

- **Node 22** and **pnpm 10** (repo pins `pnpm@10.33.4`)
- **Go 1.24.4** — required for the backend
- **PostgreSQL** with a `webapp` database

## Install

```bash
pnpm install
```

## Go toolchain

The backend requires Go 1.24.4. If Go is not on your PATH (on the dev machine it
lives at `~/sdk/go1.24.4/bin`), the `apps/server` npm scripts prepend it
automatically, so `pnpm --filter server <script>` and Turbo work out of the box.
For raw `go` commands, export it first:

```bash
export PATH="$HOME/sdk/go1.24.4/bin:$PATH"
go version   # go1.24.4
```

## Database setup

```bash
# create the database (adjust user as needed)
createdb webapp
# or: psql -d postgres -c "CREATE DATABASE webapp;"
```

Configure the backend:

```bash
cp apps/server/.env.example apps/server/.env
# edit DATABASE_DSN (user/password/host) and set a real JWT_SECRET
```

The schema is created automatically by GORM AutoMigrate on server startup — no
manual migration step. To seed an admin, register a user then promote it:

```bash
psql -d webapp -c "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

## Running

Everything at once (frontends + backend, via Turbo):

```bash
pnpm dev
```

Or per app:

```bash
pnpm --filter web dev      # :3000
pnpm --filter admin dev    # :3001
pnpm --filter doc dev      # :3002
pnpm --filter server dev   # :8080
```

Point frontends at the backend with `NEXT_PUBLIC_API_BASE_URL`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 pnpm --filter web dev
```

The apps also share one SSO session (a cookie readable across the localhost
ports) and redirect to the web login when signed out. The cross-app origins and
cookie settings (`NEXT_PUBLIC_{WEB,ADMIN,DOC}_URL`,
`NEXT_PUBLIC_AUTH_COOKIE_NAME` / `_DOMAIN`) default to the dev ports, so no extra
config is needed locally — see each app's `.env.example` and
[architecture.md](architecture.md) for the SSO flow.

### Ports

| App    | Default URL             |
| ------ | ----------------------- |
| web    | http://localhost:3000   |
| admin  | http://localhost:3001   |
| doc    | http://localhost:3002   |
| server | http://localhost:8080   |

Next.js dev servers fall back to the next free port if the default is taken
(watch the startup log for the actual URL). Note `web` and `doc` both default to
3002 when 3000/3001 are busy — start them explicitly on different ports if you
need both.

## Quality gates

```bash
pnpm typecheck   # tsc across JS workspaces + `go build ./...` for server
pnpm lint        # eslint across JS workspaces + `go vet ./...` for server
pnpm build       # production builds
pnpm format      # prettier / gofmt
```

## Backend smoke test

```bash
curl -s localhost:8080/healthz            # {"status":"ok"}

# register -> returns { user, tokens }
curl -s -X POST localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@example.com","name":"A","password":"password123"}'

# authenticated request
TOKEN=... # accessToken from the response
curl -s localhost:8080/api/users/me -H "Authorization: Bearer $TOKEN"
```

## Inspecting the database

```bash
psql -d webapp -c "\dt"                    # tables
psql -d webapp -c "\d users"               # users schema
psql -d webapp -c "SELECT id,email,role FROM users;"
```

## Troubleshooting

- **`go: command not found`** — Go isn't on PATH. Use `pnpm --filter server ...`
  (scripts inject it) or `export PATH="$HOME/sdk/go1.24.4/bin:$PATH"`.
- **Backend fails to start / DB errors** — ensure PostgreSQL is running, the
  `webapp` database exists, and `DATABASE_DSN` in `apps/server/.env` matches your
  credentials (`pg_isready -h localhost -p 5432`).
- **"Another next dev server is already running"** — Next allows one dev server
  per project dir; stop the existing one (the log prints its PID) before
  restarting.
- **Port already in use** — a dev server will pick the next free port; check the
  startup log, or free the port (`lsof -nP -iTCP:<port> -sTCP:LISTEN`).
- **401/403 from the API** — 401 means a missing/expired/invalid access token;
  403 means the route is admin-only and the user isn't an admin.
- **`pnpm install` frozen-lockfile error after editing a package.json** — run
  `pnpm install --no-frozen-lockfile` to refresh the lockfile.
