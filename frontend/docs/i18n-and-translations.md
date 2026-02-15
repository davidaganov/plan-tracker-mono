# i18n and translations

This document describes how localization is structured and how translations are generated.

## Where translations live

- Locale JSON files:
  - `src/lang/*.json`

Current locales (see `polyglot.config.json`):

- `EN` (source of truth for keys and English text)
- `RU` (generated/maintained via translation workflow)

## Runtime i18n setup

- i18n setup module:
  - `src/setupI18n.ts`

Key behaviors:

- All locale JSON files are loaded via `import.meta.glob("@/lang/*.json", { eager: true })`.
- Locale code is derived from the filename and is uppercased (`en.json` -> `EN`).
- `getLocaleFromLanguageCode(languageCode?: string)` maps Telegram language code to `SUPPORT_LOCALES` (fallback to `EN`).
- `setI18nLanguage(i18n, locale)` validates locale against `getAvailableLanguageCodes()` and falls back to `EN`.

Pluralization:

- Russian pluralization is configured via:
  - `src/config/pluralization.ts` (`slavicPluralizationRule`)

## Translation generation (polyglot-keeper)

This repository uses `polyglot-keeper` to translate locale JSON files from English to other configured locales.

Configuration:

- `polyglot.config.json`

Important fields:

- `localesDir`: `src/lang`
- `defaultLocale`: `EN`
- `locales`: list of supported locales (e.g. `EN`, `RU`)
- `provider` / `model`: translation backend
- `envFile`: `.env.development`
- `envVarName`: `VITE_POLYGLOT_API_KEY`

Workflow (recommended):

- Add or change keys/text in `src/lang/en.json`.
- Run the translation script defined in `package.json` (usually `translate`).
- Review the generated/updated locale files (e.g. `src/lang/ru.json`).

Notes / invariants:

- Keep translation keys stable. Prefer adding keys instead of renaming.
- Treat `en.json` as the source-of-truth for keys.
- Do not commit secrets. API keys should be provided via `.env.development` under `VITE_POLYGLOT_API_KEY`.
