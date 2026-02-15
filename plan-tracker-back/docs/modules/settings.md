# Settings module

- **Source**:
  - Defaults: `src/modules/settings/defaults.ts`
  - Routes: `src/modules/settings/routes.ts`
  - Service: `src/modules/settings/service.ts`

## Purpose

Store and update per-user UI settings (theme mode, primary color, locale, currency).

## Routes (mounted under `/api/settings`)

- `GET /`
  - Returns settings (creates defaults if absent)

- `PATCH /`
  - Body: subset of:
    - `themeMode?: THEME`
    - `primary?: string`
    - `locale?: SUPPORT_LOCALES`
    - `currency?: CurrencyCode`

## Auth

- Uses `getAuthUser(req)`.

## Storage

- Table/model: `UserSettings` (see `prisma/schema.prisma`).
- Uses `upsert` to avoid race conditions.

## Related modules

- Users: `docs/modules/users.md`
- Shared types: `@plans-tracker/types`
