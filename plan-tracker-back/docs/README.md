# Plans Tracker Backend documentation

This folder contains internal engineering documentation for the backend. The focus is on helping an AI agent (and humans) navigate the codebase safely and make minimal, consistent changes.

## Product context (backend scope)

This backend powers a Telegram Mini App.

Core domains:

- **Users** (derived from Telegram init data)
- **Settings** (theme/primary/locale/currency)
- **Products catalog**
- **Templates** (reusable sets of products)
- **Lists** (shopping lists and tasks lists)
- **Families** (sharing primitives)
- **Telegram** (bot integration)

## Tech stack

- **Runtime**: Node.js + TypeScript
- **Web framework**: Fastify
- **DB access**: Prisma
- **Database**: SQLite (via libsql adapter)
- **Telegram**: initData verification + Grammy bot
- **Shared contracts**: `@plans-tracker/types`

## Entry points

- Server process entry:
  - `src/server.ts`
- App composition:
  - `src/app.ts`

## Where to look first

- App assembly / plugin registration:
  - `src/app.ts`
- Auth (Telegram initData):
  - `src/plugins/auth.ts`
  - `src/common/utils/telegram.ts`
- Prisma wiring:
  - `src/plugins/prisma.ts`
  - `prisma/schema.prisma`
- Domain modules:
  - `src/modules/**`

## Documentation index

- Cross-cutting reference:
  - `docs/agent-reference.md`

Module docs:

- `docs/modules/products.md`
- `docs/modules/templates.md`
- `docs/modules/locations.md`
- `docs/modules/lists.md`
- `docs/modules/settings.md`
- `docs/modules/users.md`
- `docs/modules/families.md`
- `docs/modules/telegram.md`
