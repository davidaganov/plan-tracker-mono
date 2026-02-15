# Agent reference: cross-cutting project modules

This document is a quick reference for files and folders that cut across many features. The goal is to reduce duplication and keep new code consistent with existing patterns.

## Entry point `src/main.ts`

`src/main.ts` is the main bootstrap entry point.

Key behaviors:

- Initializes Telegram WebApp SDK: `WebApp.ready()`
- Derives Telegram context:
  - `WebApp.initDataUnsafe?.user`
  - `WebApp.colorScheme`
  - init data via `getTelegramInitData()`
- Creates and wires app-level services:
  - Pinia stores
  - Router
  - i18n
- Bootstraps user + settings:
  - `userStore.fetchUser(initData)`
  - `settingsStore.hydrate(...)`
- Applies UI settings to DOM:
  - `applyPrimary(settingsStore.primary)`
  - `useAppSettings(...)`

Notes:

- `eruda` is enabled in dev mode only.

## Pages `src/views/**`, Router `src/router/**`

Application pages live under `src/views/**` and are wired via `src/router/**`.

- Routes index:
  - `src/router/mainRoutes.ts`

Key routes:

- `/products` -> `src/views/ProductsView.vue`
- `/products/templates/:id` -> `src/views/TemplateView.vue`
- `/products/lists/:id` -> `src/views/ListView.vue`
- `/tasks` -> `src/views/TasksView.vue`
- `/family` -> `src/views/FamilyView.vue`
- `/settings` -> `src/views/SettingsView.vue`

## Layouts `src/layouts/**`

Application layouts (top-level UI shells).

- Default layout:
  - `src/layouts/default.vue`

## Stores `src/stores/**`

Pinia stores live under `src/stores/**`.

Current store modules:

- `src/stores/catalog.ts`
- `src/stores/lists.ts`
- `src/stores/locations.ts`
- `src/stores/settings.ts`
- `src/stores/templates.ts`
- `src/stores/user.ts`

Rules / invariants:

- Prefer keeping domain state in stores and calling request-layer functions from stores.
- Avoid moving data-fetching logic into view components unless it is purely presentational.

## Services and requests `src/services/**`

HTTP and API-related logic lives under `src/services/**`.

Key locations:

- `src/services/request.ts`
- `src/services/client.ts`
- `src/services/requests/**`

Development proxy:

- `/api/*` is proxied to `VITE_BACKEND_URL` in `vite.config.ts`.

## Telegram integration

Telegram WebApp integration is initialized during bootstrap.

Entry point:

- `src/main.ts`
  - calls `WebApp.ready()`
  - reads Telegram init data
  - hydrates settings and user store

Rules / invariants:

- Treat Telegram init data as an integration contract.
- Avoid logging sensitive data (initData/user identifiers) in production builds.

## i18n `src/lang/**`, `src/setupI18n.ts`

Translations live under:

- `src/lang/**`

i18n setup:

- `src/setupI18n.ts`

Rules / invariants:

- Use `meta.titleKey` in routes for page titles (see `src/router/**`).
- Keep translation keys stable; prefer adding new keys over renaming existing ones.

Translation generation:

- `polyglot-keeper` is used to translate locale JSON files from English to the configured languages.
- Config:
  - `polyglot.config.json`
- Detailed workflow:
  - `docs/i18n-and-translations.md`

## Config `src/config/**`

Configuration constants and small helpers used across many features.

Notable modules:

- Navigation:
  - `src/config/bottomTabs.ts` (bottom tabs routing + label keys)
- Products workspace:
  - `src/config/entityTabs.ts` (route prefixes and ref keys for `/products` tabs)
- i18n:
  - `src/config/languages.ts` (available locales list derived from `@plans-tracker/types`)
  - `src/config/pluralization.ts` (custom plural rules for Slavic languages)
- Products UI:
  - `src/config/listFilters.ts`
  - `src/config/quantityUnits.ts`
  - `src/config/settingsOptions.ts`

## Bootstrap `src/bootstrap/**`

Low-level “apply settings to DOM” helpers.

- `src/bootstrap/appSettings.ts`
  - theme resolution (`THEME.SYSTEM` + Telegram scheme)
  - writes theme into `html[data-theme]`
  - writes primary CSS variables: `--app-primary`, `--app-primary-foreground`
  - sets `html[lang]`

## Styles `src/assets/styles/**`

Global styles and theme tokens.

- `src/assets/styles/lib/tailwind.css`
  - Tailwind v4 entrypoint
  - binds Tailwind tokens to CSS variables (`--app-*`)
- `src/assets/styles/variables.css`
  - CSS variables for colors, typography, max-width
- `src/assets/styles/main.css`
  - global behavior tweaks (selection policy, overscroll, touch-action)

## Composables `src/composables/**`

Project composables (reusable logic units).

Example:

- `src/composables/useEntityTab.ts`

Rules / invariants:

- If you change a composable public API (params/return shape), update all usages.

## UI components `src/components/**`

Components live under `src/components/**`.

Page-level components are typically grouped under:

- `src/components/pages/**`

Shared UI building blocks are under:

- `src/components/ui/**`

Notes:

- Some UI primitives are sourced from `src/components/ui/shadcn`.

## Types

Shared project types are imported from:

- `@plans-tracker/types` (local workspace dependency)

Rules / invariants:

- `@plans-tracker/types` is the single source of truth for shared contracts between backend and frontend.
- Treat exported enums/types as contract-like.
- Prefer reusing types from `@plans-tracker/types` instead of redefining shapes locally.
