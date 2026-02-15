# `useAppSettings`

- **Source**: `src/composables/useAppSettings.ts`

## Purpose

Bind reactive settings (theme, primary color, locale) to the actual UI/DOM via centralized bootstrap helpers.

## Inputs

- `params: {
  themeMode: MaybeRefOrGetter<SettingsDto["themeMode"]>
  primary: MaybeRefOrGetter<string>
  locale: MaybeRefOrGetter<SUPPORT_LOCALES>
  telegramColorScheme?: MaybeRefOrGetter<THEME | undefined>
  i18n: ReturnType<typeof setupI18n>
}`

Meaning:

- `themeMode` controls app theme mode (including system mode).
- `primary` is the primary color hex.
- `locale` is the selected locale.
- `telegramColorScheme` is Telegram-provided theme hint.
- `i18n` is the app i18n instance.

## Returns

- `{ stop }`
  - `stop(): void` stops the internal `watchEffect`.

## Side effects

- Calls UI/DOM binding helpers:
  - `applyThemeMode(themeMode, telegramTheme)`
  - `applyPrimary(primary)`
  - `applyLocale(locale)`
- Updates i18n runtime language:
  - `setI18nLanguage(i18n, locale)`

## Dependencies

- `src/bootstrap/appSettings`
- `src/setupI18n`
- Types/enums from `@plans-tracker/types`

## Usage

Used during bootstrap in `src/main.ts` after settings are hydrated.

## Notes

- This composable is intentionally reactive: any change in `themeMode` / `primary` / `locale` will be applied immediately.
- Consider calling `stop()` if you mount it outside the main app lifetime.
