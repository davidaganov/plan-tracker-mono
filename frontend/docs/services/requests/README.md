# Requests modules

This folder documents request modules under `src/services/requests/**`.

## Purpose

Request modules provide thin, typed wrappers around `request.*` calls.

Conventions:

- Keep modules small and focused on a resource (lists, templates, locations, etc.).
- Prefer reusing DTOs from `@plans-tracker/types`.

## Index

- Lists:
  - `src/services/requests/lists.ts` -> `docs/services/requests/lists.md`
- Catalog:
  - `src/services/requests/catalog/index.ts` -> `docs/services/requests/catalog.md`
- Locations:
  - `src/services/requests/locations/index.ts` -> `docs/services/requests/locations.md`
- Settings:
  - `src/services/requests/settings/index.ts` -> `docs/services/requests/settings.md`
- Templates:
  - `src/services/requests/templates/index.ts` -> `docs/services/requests/templates.md`
- User:
  - `src/services/requests/user/index.ts` -> `docs/services/requests/user.md`
- Telegram helpers:
  - `src/services/requests/telegram/telegram.ts` -> `docs/services/requests/telegram.md`
