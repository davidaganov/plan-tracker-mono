# Settings requests

- **Source**:
  - `src/services/requests/settings/index.ts`
  - `src/services/requests/settings/routes.ts`

## Purpose

Typed HTTP wrappers for user settings.

## API

- `getSettings(initData?: string): Promise<SettingsDto>`
- `updateSettings(settings: UpdateSettingsDto, initData?: string): Promise<SettingsDto>`

## Auth

Unlike most request modules, settings requests explicitly pass `initData`.

This is required because settings are user-specific and saving should be blocked when Telegram init data is missing.

## Dependencies

- `src/services/request.ts`
- DTOs from `@plans-tracker/types`

## Notes

- Endpoints are `api/settings`.
- In stores, saving is usually debounced/throttled (see `src/stores/settings.ts`).
