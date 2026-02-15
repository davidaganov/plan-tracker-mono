# User requests

- **Source**:
  - `src/services/requests/user/index.ts`
  - `src/services/requests/user/routes.ts`

## Purpose

Typed HTTP wrappers for current user retrieval.

## API

- `getUser(initData?: string): Promise<AuthUserDto>`

## Auth

- `initData` is passed to the request options. If not passed, request layer may fall back to `WebApp.initData`.

## Dependencies

- `src/services/request.ts`
- DTOs from `@plans-tracker/types`

## Notes

- Endpoint is `/api/user`.
- This request is used during bootstrap (`src/main.ts`) and during settings hydration (`src/stores/settings.ts`).
