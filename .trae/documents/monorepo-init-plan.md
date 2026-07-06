# Web-App Monorepo 初始化方案

## Context（背景）

当前仓库 `web-app` 仅有 `README.md` 与 `.git`，是一个空仓库。目标是把它初始化为一个**典型 Web 应用的 pnpm monorepo**：前端统一 Next.js + React + TypeScript + zustand + zod + shadcn(Base UI) + tabler 图标，后端 Go + Gin + PostgreSQL(GORM) + JWT 鉴权 + 结构化日志。

已确认的关键决策：
- 共享数据模型包命名为 **`@workspace/schemas`**（用 zod 定义 schema，`z.infer` 派生类型，同时充当 schema 与 types 来源）。
- 后端鉴权采用 **JWT**（access/refresh token，前后端分离，web/admin 可复用）。
- 数据层采用 **GORM** + `gorm.io/driver/postgres`。
- Go server **纳入 Turbo**：`apps/server` 加一层 `package.json` 包装脚本，`pnpm dev` 可一键跑全栈。

环境已核实：Node `v22.22.3`、pnpm `10.29.2`、Go `1.24.4`（位于 `~/sdk/go1.24.4/bin/go`，**未在 PATH**，执行 Go 命令需用绝对路径或先 export PATH）。

## 目标目录结构

```
web-app/
├── package.json            # 根，private，scripts 走 turbo
├── pnpm-workspace.yaml     # workspaces: apps/*, packages/*
├── turbo.json              # dev/build/lint/type-check 管线
├── .npmrc                  # pnpm 设置
├── .gitignore
├── .node-version           # 22
├── apps/
│   ├── web/                # Next.js：首页 + 登录/注册
│   ├── admin/              # Next.js：用户信息管理
│   ├── doc/                # Next.js：接口文档
│   └── server/             # Go + Gin（含 package.json 包装）
└── packages/
    ├── ui/                 # @workspace/ui       shadcn 组件库
    ├── utils/              # @workspace/utils     通用工具
    ├── apis/               # @workspace/apis      HTTP 接口封装
    ├── schemas/            # @workspace/schemas   zod schema + 类型
    ├── typescript-config/  # @workspace/typescript-config  共享 tsconfig
    └── eslint-config/      # @workspace/eslint-config      共享 eslint
```

## 实施步骤

### 步骤 0 — 基线：shadcn monorepo 脚手架

用用户指定命令生成 Turborepo + shadcn 基线（该模板产出 `apps/web` + `packages/ui` + `packages/typescript-config` + `packages/eslint-config` + `turbo.json` + `pnpm-workspace.yaml`，Next 15 / React 19 / Tailwind v4）：

```bash
pnpm dlx shadcn@latest init --preset b1Zzra9y4 --base base --template next --monorepo --pointer
```

注意：仓库已有 `README.md`/`.git` 但无 `package.json`，CLI 会判定为“新建项目”并可能创建子目录。执行策略：在**临时目录**中运行该命令，再把生成内容移动/合并到仓库根（保留既有 `README.md` 与 `.git`）。生成后校验 `apps/web/components.json` 的 `iconLibrary` 为 `tabler`；若预设未指定，则改为 tabler 并安装 `@tabler/icons-react`。

### 步骤 1 — 根配置对齐

- `pnpm-workspace.yaml` 确认包含 `apps/*` 与 `packages/*`。
- 根 `package.json` 补 scripts：`dev`/`build`/`lint`/`type-check`/`format`，均代理到 `turbo run`；`packageManager` 固定 pnpm 10。
- `turbo.json` 增加 `type-check` 任务；`dev` 任务设 `cache:false, persistent:true`，`build` 设 `dependsOn: ["^build"]`。
- 新增 `.node-version`（22）。

### 步骤 2 — 共享 packages

复用步骤 0 生成的 `packages/typescript-config`、`packages/eslint-config` 作为其它包/应用的 base。新增三个包，均带 `package.json`（name `@workspace/<x>`）、`tsconfig.json`（extends `@workspace/typescript-config`）与 `src/`：

- **`@workspace/schemas`**：依赖 `zod`。定义 `authSchema`（`loginSchema`/`registerSchema`）、`userSchema`，用 `z.infer` 导出对应 TS 类型；通过 `exports` 暴露 `./auth`、`./user` 等子路径。作为 apis/web/admin 的单一数据源。
- **`@workspace/apis`**：依赖 `@workspace/schemas`。封装 HTTP 客户端（原生 `fetch` 封装，`NEXT_PUBLIC_API_BASE_URL` 可配），提供 `login/register/refresh`、`getUsers/getUserById` 等函数，入参/返参用 schemas 校验。
- **`@workspace/utils`**：通用工具（日期/格式化/`invariant` 等），不含 UI。`cn` 保留在 `@workspace/ui/lib/utils`。

### 步骤 3 — 新增前端应用 admin / doc

以 `apps/web` 为模板复制并改造（保持 monorepo 配置一致：Tailwind v4 通过 `@workspace/ui` globals.css，tsconfig 继承共享配置，各自 `components.json` 指向 `@workspace/ui`）：

- **`apps/admin`**：用户信息管理页面（列表 + 详情/编辑），接入 `@workspace/apis`、`@workspace/schemas`；用 zustand 建 `authStore` 保存 token/用户态。
- **`apps/doc`**：接口文档站点。方案：Next.js 应用渲染后端产出的 OpenAPI（用 `swagger-ui-react` 或 Scalar 消费 `/swagger.json`）；先落一个可运行的文档页占位，OpenAPI 生成为后续增量。

`apps/web` 补齐：首页 + 登录/注册页面（表单用 `@workspace/schemas` 校验，提交走 `@workspace/apis`，token 存 zustand）。

### 步骤 4 — Go 后端 `apps/server`

模块 `go 1.24.4`。结构：

```
apps/server/
├── go.mod / go.sum
├── package.json           # turbo 包装：dev=go run（air 可选），build=go build，lint=go vet
├── cmd/server/main.go     # 装配 config→logger→db→router→run
├── internal/
│   ├── config/            # 环境变量加载（godotenv + struct）
│   ├── router/            # gin 路由注册，挂中间件
│   ├── middleware/        # JWT 鉴权、请求日志、Recovery、CORS
│   ├── handler/           # auth（注册/登录/刷新）、user（增删改查）
│   ├── service/           # 业务逻辑
│   ├── repository/        # GORM 数据访问
│   ├── model/             # GORM 模型（User 等）
│   └── auth/              # JWT 签发/校验、bcrypt 密码哈希
├── pkg/logger/            # slog 结构化日志（JSON handler）
├── migrations/            # 起步用 GORM AutoMigrate，SQL 迁移为后续
├── .env.example           # DB_DSN / JWT_SECRET / PORT ...
└── Makefile               # run/build/tidy 便捷命令
```

关键依赖：`github.com/gin-gonic/gin`、`gorm.io/gorm` + `gorm.io/driver/postgres`、`github.com/golang-jwt/jwt/v5`、`golang.org/x/crypto/bcrypt`、`github.com/joho/godotenv`；日志用标准库 `log/slog`（零额外依赖，结构化 JSON），经 gin 中间件注入 request-scoped 日志。

鉴权流程：注册（bcrypt 存哈希）→ 登录（校验后签发 access+refresh JWT）→ 受保护路由经 JWT 中间件解析并注入用户上下文 → refresh 端点续签。

Turbo 集成：`apps/server/package.json` 的 `dev`/`build` 调用 Go（脚本内用 `~/sdk/go1.24.4/bin/go` 或依赖已 export 的 PATH）；纳入根 `pnpm dev` 编排。

### 步骤 5 — 安装与校验

`pnpm install` 装齐前端依赖；`apps/server` 执行 `go mod tidy`（用 Go 1.24.4 绝对路径）。

## 复用与约定

- 数据模型单一来源为 `@workspace/schemas`，前端各处 import 其派生类型，避免重复定义。
- UI 组件统一走 `@workspace/ui`，`shadcn add` 一律安装到 `packages/ui`（各 app 的 `components.json` 已指向）。
- 图标统一 `@tabler/icons-react`。
- 状态用 zustand，鉴权态集中在 `authStore`。

## 验证（Verification）

1. **依赖安装**：`pnpm install` 无报错；`~/sdk/go1.24.4/bin/go mod tidy`（在 `apps/server`）成功。
2. **类型检查**：根目录 `pnpm type-check` 全绿。
3. **前端起服务**：`pnpm --filter web dev`、`--filter admin dev`、`--filter doc dev` 分别能起（默认 3000/3001/3002），用浏览器（integrated_browser MCP）核对首页、登录/注册、用户管理、文档页可渲染。
4. **后端起服务**：`~/sdk/go1.24.4/bin/go run ./cmd/server`（需本地 PostgreSQL，DSN 走 `.env`）能起监听；`curl` 打通 `POST /api/auth/register`、`POST /api/auth/login`（拿到 JWT）、带 token 访问受保护的 `GET /api/users`。
5. **全栈联调**：web 登录页调用 `@workspace/apis` 命中后端，token 存入 zustand 后可访问受保护接口。
6. **一键编排**：根目录 `pnpm dev` 能同时拉起前端应用与 Go server（PATH 已含 Go）。

## 待办 / 后续增量（非本次阻塞）

- OpenAPI/Swagger 自动生成（供 `apps/doc` 消费）。
- SQL 迁移工具（如 golang-migrate）替代 AutoMigrate。
- CI（lint + type-check + go vet/test）。
