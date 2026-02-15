# `request` / `apiRequest`

- **Source**: `src/services/request.ts`

## Purpose

Provide a minimal fetch-based HTTP wrapper used by all request modules.

Key responsibilities:

- base URL resolution (`API_CONFIG.baseURL`)
- query param handling
- JSON request bodies
- Telegram init data auth headers
- timeout via `AbortController`
- reviving ISO date strings into `Date` objects for known keys

## Public API

- `API_CONFIG`
- `apiRequest<T>(endpoint: string, options?: ApiRequestOptions): Promise<T>`
- `request.get<T>(endpoint, options?)`
- `request.post<T>(endpoint, body?, options?)`
- `request.put<T>(endpoint, body?, options?)`
- `request.patch<T>(endpoint, body?, options?)`
- `request.delete<T>(endpoint, options?)`

## Inputs

- `ApiRequestOptions` (from `src/types/api`):
  - `method?: string`
  - `params?: Record<string, string | number | boolean>`
  - `body?: unknown`
  - `timeout?: number`
  - `headers?: Record<string, string>`
  - `initData?: string`

## Auth and headers

Telegram auth headers are appended when init data exists:

- `x-telegram-init-data`
- `tg-init-data`

Init data source:

- `options.initData` or `WebApp.initData` (from `@twa-dev/sdk`)

## Date revival

When parsing JSON responses, `reviveDates()` recursively converts string fields into `Date` objects for keys:

- `createdAt`, `updatedAt`, `checkedAt`, `usedAt`, `expiresAt`, `joinedAt`

## Error behavior

- Non-`ok` HTTP response throws an `ApiError` shape with `status`, `statusText`, and raw response text in `data`.
- Timeout results in an `ApiError` with `status: 408`.
- Other network errors are surfaced as `status: 0`.

## Notes / invariants

- Prefer using relative endpoints like `/api/...` and rely on Vite proxy in development.
- If backend adds new date fields, update `DATE_KEYS` to keep `Date` revival consistent.
- Avoid leaking `initData` into logs or errors shown to users.
