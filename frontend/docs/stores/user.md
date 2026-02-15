# `user` store

- **Source**: `src/stores/user.ts`

## Purpose

Hold the authenticated user state derived from Telegram init data.

## State

- `user: Ref<AuthUserDto | null>`
- `isLoading: Ref<boolean>`
- `error: Ref<string | null>`

## Computed

- `isAuthenticated: ComputedRef<boolean>`

## Actions

- `fetchUser(initData?: string): Promise<AuthUserDto | null>`
  - Loads current user via `ApiClient.user.getUser(initData)`.
  - On error sets `user` to `null` and returns `null`.

- `setUser(next: AuthUserDto | null): void`
- `updateUserSettingsLocal(settings: AuthUserDto["settings"]): void`
  - Updates nested settings inside `user` without refetching.

## External dependencies

- API:
  - `ApiClient.user` (`src/services/requests/user/index.ts`)

## Error/loading strategy

- Error is stored as a string and intended for UI display.

## Notes

- This store is used during bootstrap (`src/main.ts`) and settings hydration (`src/stores/settings.ts`).
