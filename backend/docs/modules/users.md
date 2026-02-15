# Users module

- **Source**:
  - Routes: `src/modules/users/routes.ts`
  - Auth plugin upsert: `src/plugins/auth.ts`

## Purpose

Expose current authenticated user profile.

A user is derived from Telegram init data and persisted in DB.

## Routes (mounted under `/api/user`)

- `GET /`
  - Returns user profile + settings.

## Auth

- Uses `getAuthUser(req)`.
- User row is upserted by `telegramId` in `auth` plugin.

## Notes

- Settings are retrieved via `SettingsService.getOrCreate(user.id)`.

## Related modules

- Settings: `docs/modules/settings.md`
- Auth: `docs/agent-reference.md` (Auth section)
