# `settings` store

- **Source**: `src/stores/settings.ts`

## Purpose

Bootstrap and manage user settings (theme, primary color, locale, currency) with a draft/server model and debounced server persistence.

## State

- `hydrated: Ref<boolean>` - whether settings were initialized.
- `isLoading: Ref<boolean>` - bootstrap loading flag.
- `error: Ref<string | null>`
- `server: Ref<SettingsDto | null>` - last server-synced settings.
- `draft: Ref<SettingsDto | null>` - editable local copy.
- `saving: Ref<boolean>` - whether a save request is currently in-flight.
- `saveTimer: Ref<ReturnType<typeof setTimeout> | null>` - debounce timer.

## Computed

- `canSave: ComputedRef<boolean>`
  - `true` only when Telegram initData exists.
- `primary`, `currency`, `localeCode`, `themeMode`
- Two-way models:
  - `primaryModel`, `currencyModel`, `localeModel`, `themeModeModel`

## Actions

- `hydrate(ctx?: { telegramLanguageCode?: string; telegramColorScheme?: "light" | "dark" }): Promise<void>`
  - Bootstraps the store once.
  - Loads user (via `userStore.fetchUser`) and derives settings.
  - Applies locale fallback based on Telegram language.

- `setDraft(patch: UpdateSettingsDto): void`
  - Updates `draft` and schedules debounced save.

- `flushSave(): Promise<void>`
  - Computes patch (`diffSettings`) and persists via `ApiClient.settings.updateSettings(patch, initData)`.
  - Updates `userStore` local settings on success.

## External dependencies

- `useUserStore` (`src/stores/user.ts`)
- `ApiClient.settings` (`src/services/requests/settings/index.ts`)
- Telegram initData:
  - `getTelegramInitData()` (`src/services/requests/telegram/telegram.ts`)
- i18n locale fallback:
  - `getLocaleFromLanguageCode()` (`src/setupI18n.ts`)

## Error/loading strategy

- `hydrate` sets a full fallback `draft` even when remote fetch fails.
- Save is skipped when no initData exists.

## Notes

- Saving is debounced (~400ms). This is intentional to support slider/color picker style inputs.
- `DEFAULT_SETTINGS` defines defaults for new users and offline fallback.
- The store does not directly apply settings to DOM; bootstrap should use `useAppSettings` for that.
