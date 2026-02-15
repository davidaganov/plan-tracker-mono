# Telegram helpers

- **Source**: `src/services/requests/telegram/telegram.ts`

## Purpose

Provide a single helper for retrieving Telegram init data from the SDK.

## API

- `getTelegramInitData(): string`

## Notes

- Returns `WebApp.initData` from `@twa-dev/sdk`.
- Treat init data as sensitive information; avoid logging it.
