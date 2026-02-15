# Agent reference: backend cross-cutting modules

This document is a quick reference for code that cuts across multiple modules.

## Entry points

- `src/server.ts`
  - loads env via `dotenv/config`
  - calls `buildApp()`
  - listens on `PORT` (default `3000`) on `0.0.0.0`

- `src/app.ts`
  - registers core Fastify plugins
  - registers custom plugins (order matters)
  - mounts module routes under `/api/*`

## Environment variables

Do not commit secrets. Document variable names only.

- `PORT`
- `DATABASE_URL`
- `BOT_TOKEN`
- `BOT_WEBAPP_URL`
- `TG_INIT_DATA_MAX_AGE_SECONDS` (optional)

## Auth (Telegram initData)

- Plugin:
  - `src/plugins/auth.ts`

Behavior:

- Expects Telegram init data in headers:
  - `x-telegram-init-data`
  - `tg-init-data`
- Verifies signature using `BOT_TOKEN`.
- Enforces max age for `auth_date` (defaults to 1 hour).
- Upserts `User` by `telegramId` and attaches it to `req.user`.

Verification implementation:

- `src/common/utils/telegram.ts` (`verifyTelegramInitData`)

Rules / invariants:

- Treat init data as sensitive.
- Avoid logging raw init data.
- Non-public routes require init data by default.

## Database / Prisma

- Prisma schema:
  - `prisma/schema.prisma`

- Prisma integration:
  - `src/plugins/prisma.ts`

Behavior:

- Uses `@prisma/adapter-libsql` and `DATABASE_URL` (defaults to `file:./dev.db`).
- Decorates `fastify.prisma`.
- Disconnects on server close.

## Error handling

- Global error handler:
  - `src/plugins/error-handler.ts`

Behavior:

- Converts `ServiceError` into HTTP errors.
- Supports a legacy `"Type:message"` error string format.

## Core plugins

- `src/plugins/sensible.ts`
  - registers `@fastify/sensible` (`httpErrors`, helpers)

- `src/plugins/telegram-bot.ts`
  - wires Telegram bot runtime (Grammy)

## Common layer `src/common/**`

- Hooks:
  - `src/common/hooks/require-auth.ts`
    - `requireAuth` (preHandler hook)
    - `getAuthUser` (helper; throws 401 if missing)

- Errors:
  - `src/common/errors/**` (`ServiceError`)

- Services:
  - `src/common/services/**` (e.g. family access checks)

- Utils:
  - `src/common/utils/normalize-key.ts`
  - `src/common/utils/merge-personal-and-family.ts`
  - `src/common/utils/dates.ts`
  - `src/common/utils/telegram.ts`

## Modules `src/modules/**`

Mounted in `src/app.ts` under:

- `/api/settings`
- `/api/user`
- `/api/families`
- `/api/lists`
- `/api/locations`
- `/api/products`
- `/api/templates`

Module docs live under `docs/modules/**`.

## Shared types (single source of truth)

- `@plans-tracker/types`

Rules / invariants:

- This package is the single source of truth for DTOs/enums used by both backend and frontend.
- Avoid duplicating DTO shapes in backend modules.
