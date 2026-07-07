# Backend (`apps/server`)

Go + Gin HTTP API with GORM/PostgreSQL persistence, JWT auth, and structured
logging via `log/slog`. Module path: `github.com/web-app/server`; requires Go
1.24.4.

## Layering

```
cmd/server/main.go            wiring: config → logger → db → services → router → run
internal/
  config/      env-driven Config (godotenv + defaults)
  database/    GORM connection + AutoMigrate
  model/       GORM entities (User, Role, RequestLog)
  repository/  data access (UserRepository, RequestLogRepository)
  service/     business logic (AuthService, UserService, RequestLogService) + domain errors
  auth/        JWT Manager (sign/parse) + bcrypt password helpers
  reqctx/      request-scoped context values (trace id, user id, method, path)
  middleware/  Auth (bearer), RequireAdmin, Tracing, RequestLogger
  handler/     Gin handlers + wire DTOs + error responses
  router/      route table, middleware chain, CORS
pkg/
  logger/      slog JSON/text handler factory + DB-persisting handler (Sink)
```

Dependencies flow inward: `handler → service → repository → model`. `auth`,
`config` and `reqctx` are leaf utilities. `main.go` is the only place that
constructs and wires concrete instances.

## Data model

`internal/model/user.go` — created by GORM AutoMigrate:

| Column          | Type          | Notes                                |
| --------------- | ------------- | ------------------------------------ |
| `id`            | uuid          | PK, application-generated            |
| `email`         | text          | unique index, not null               |
| `name`          | text          | not null                             |
| `password_hash` | text          | bcrypt, `json:"-"` (never serialized)|
| `role`          | varchar(16)   | `user` \| `admin`, default `user`    |
| `created_at`    | timestamptz   |                                      |
| `updated_at`    | timestamptz   |                                      |
| `deleted_at`    | timestamptz   | GORM soft delete, indexed            |

`internal/model/request_log.go` — append-only structured log, also created by
AutoMigrate. Written asynchronously by the logging layer (see **Logging** below),
never carries request/response bodies:

| Column       | Type        | Notes                                       |
| ------------ | ----------- | ------------------------------------------- |
| `id`         | uuid        | PK, generated in the sink                   |
| `trace_id`   | uuid        | indexed; groups the entries of one request  |
| `level`      | varchar(16) | `debug` \| `info` \| `warn` \| `error`, indexed |
| `message`    | text        | slog message (e.g. `request`, `auth.login.success`) |
| `method`     | text        | indexed                                     |
| `path`       | text        | indexed (raw path, not route template)      |
| `status`     | int         | indexed (0 for step logs, HTTP status on the request-summary row) |
| `latency_ms` | bigint      | request latency in ms                       |
| `ip`         | text        | client ip                                   |
| `user_id`    | text        | indexed; empty until `Auth` resolves it     |
| `attrs`      | text        | JSON blob of extra slog attributes          |
| `created_at` | timestamptz | indexed                                     |

Wire DTOs (`internal/handler/dto.go`) shape the JSON: camelCase fields, RFC3339
UTC timestamps, and no password hash. This matches `@workspace/schemas`.

## Authentication

- **Passwords**: bcrypt hashed (`internal/auth/password.go`).
- **Tokens**: HS256 JWTs (`internal/auth/jwt.go`). Claims carry `uid`, `role`,
  and `typ` (`access` | `refresh`) plus `iat`/`exp`. Access TTL 15m, refresh TTL
  168h by default. `Parse` rejects non-HMAC algorithms.
- **Middleware** (`internal/middleware/auth.go`):
  - `Auth` requires `Authorization: Bearer <token>`, accepts only `access`
    tokens, injects `userID` / `userRole` into the Gin context, and seeds the
    `user id` into the request context (`reqctx`) so downstream logs are attributed.
  - `RequireAdmin` gates admin-only routes (403 otherwise).
- **Flow**: register (bcrypt + issue tokens) → login (verify + issue) →
  protected routes (validate access token) → `/api/auth/refresh` (swap a valid
  refresh token for a new pair).

## Logging

Every request carries a **trace id** and each layer emits correlated structured
logs that are persisted, so a request's full call chain can be reconstructed.

- **`internal/middleware/logger.go`**:
  - `Tracing` generates a `uuid` trace id, seeds it (plus method/path) into the
    request `context.Context` via `reqctx`, and echoes it back in the
    `X-Request-Id` response header.
  - `RequestLogger` logs the request-summary row after `c.Next()`, with a
    severity derived from the status (≥500 → error, ≥400 → warn, else info).
- **Step logs**: services and middleware call `slog.InfoContext(ctx, …)` at key
  steps (`auth.authorized`, `auth.login.success`, `user.list`, `user.updated`,
  …). All entries sharing a trace id form the call chain.
- **Persistence** (`pkg/logger/dbhandler.go`): `NewWithSink` wraps the normal
  text/JSON console handler in a `DBHandler` that also enriches each record
  (trace id, user id, method, path from `reqctx`) and forwards it to a `Sink`.
  `RequestLogService` implements `Sink` with a buffered channel drained by a
  background goroutine — logging never blocks the request. Records below `info`
  stay console-only; sink write failures go to stderr (never back through slog,
  to avoid recursion); a full buffer drops the entry.

## Endpoints

Base URL `http://localhost:8080`. Registered in `internal/router/router.go`.

| Method | Path                 | Auth  | Notes                          |
| ------ | -------------------- | ----- | ------------------------------ |
| GET    | `/healthz`           | —     | `{"status":"ok"}`              |
| POST   | `/api/auth/register` | —     | body `{ email, name, password }` → 201 `{ user, tokens }` |
| POST   | `/api/auth/login`    | —     | body `{ email, password }` → `{ user, tokens }` |
| POST   | `/api/auth/refresh`  | —     | body `{ refreshToken }` → `{ accessToken, refreshToken }` |
| GET    | `/api/users/me`      | user  | current user                   |
| GET    | `/api/users`         | admin | paginated (`page`, `pageSize`) |
| GET    | `/api/users/:id`     | admin | user by id                     |
| PATCH  | `/api/users/:id`     | admin | body `{ name?, role? }`        |
| GET    | `/api/logs`          | admin | paginated; filters `keyword`, `userId`, `level`, `from`, `to` (RFC3339) |
| GET    | `/api/logs/:id`      | admin | single log entry               |
| GET    | `/api/logs/:id/chain`| admin | `{ traceId, items }` — the log's full call chain, oldest first |

`GET /api/logs` `keyword` matches (case-insensitive) message/path substrings and
exact log id / trace id. Every response also carries an `X-Request-Id` header.

Errors use a consistent envelope: `{ "code": string, "message": string }`.
Login failures are intentionally ambiguous (`invalid_credentials`, 401) so they
don't reveal whether an email exists.

## Configuration

`internal/config/config.go` loads `apps/server/.env` (via godotenv) then the
environment, with defaults. See `.env.example`:

| Var                 | Default                          | Purpose                    |
| ------------------- | -------------------------------- | -------------------------- |
| `PORT`              | `8080`                           | listen port                |
| `APP_ENV`           | `development`                    | `development` → text logs, debug level; else JSON |
| `DATABASE_DSN`      | `host=localhost ... dbname=webapp` | PostgreSQL DSN           |
| `JWT_SECRET`        | `dev-insecure-secret-change-me`  | HMAC signing key           |
| `ACCESS_TOKEN_TTL`  | `15m`                            | access token lifetime      |
| `REFRESH_TOKEN_TTL` | `168h`                           | refresh token lifetime     |

## Running & testing

```bash
export PATH="$HOME/sdk/go1.24.4/bin:$PATH"   # Go is not on PATH by default

# via Turbo (scripts already inject the Go PATH):
pnpm --filter server dev      # go run ./cmd/server
pnpm --filter server build    # -> apps/server/bin/server
pnpm --filter server typecheck # go build ./...
pnpm --filter server lint     # go vet ./...

# or directly:
cd apps/server && make run     # run | build | tidy | vet | fmt
```

Smoke test:

```bash
curl -s localhost:8080/healthz
curl -s -X POST localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@example.com","name":"A","password":"password123"}'
```

## Known limitations (pre-production)

- `JWT_SECRET` default is insecure — set a strong value.
- CORS allows all origins (`*`); restrict in production.
- No refresh-token rotation or revocation; logout only clears client state.
- No rate limiting on auth endpoints.
- AutoMigrate is used instead of versioned SQL migrations.
