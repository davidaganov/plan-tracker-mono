# Project overview

## Product

This application is a Telegram Mini App for “smart” planning around shopping and household routines.

Core concepts:

- **Products catalog**: predefined products with metadata (price, where it is bought, measurement unit).
- **Templates**: reusable sets of products (e.g. recipes, recurring bundles).
- **Lists**: shopping lists built from products/templates.
- **Tasks**: lightweight lists of household tasks (e.g. cleaning checklist, repair preparation).

Design goal:

- The UI aims to feel close to modern iOS / Telegram design language.
- Primary visual reference: **Telegram Wallet**.

## Architecture (high level)

- **Frontend**: Vue 3 + Vite + TypeScript
- **State**: Pinia stores in `src/stores/**`
- **Routing**: Vue Router routes in `src/router/**`
- **i18n**: `vue-i18n` (`src/setupI18n.ts`, translations under `src/lang/**`)
- **Validation**: vee-validate + yup
- **Telegram integration**: `@twa-dev/sdk` (bootstrap in `src/main.ts`)
- **UI**: Tailwind (see `src/assets/styles/lib/tailwind.css`)

## Backend integration

In development, the Vite dev server proxies API calls:

- `/api/*` -> `VITE_BACKEND_URL` (see `vite.config.ts`)

Authentication / user context is derived from Telegram init data:

- `src/services/requests/telegram/telegram` (see `getTelegramInitData()` usage in `src/main.ts`)

## Where to look first

- **Bootstrap**: `src/main.ts`
- **Routing**: `src/router/**`
- **Layouts**: `src/layouts/**`
- **Pages**: `src/views/**`
- **Stores**: `src/stores/**`
- **API layer**: `src/services/request.ts`, `src/services/client.ts`, `src/services/requests/**`
- **Composable utilities**: `src/composables/**`

## Conventions used in codebase

- Prefer keeping domain state in Pinia stores, and UI state in components/composables.
- Prefer documenting cross-cutting modules and invariants in `docs/agent-reference.md`.

# AI / Agentic workflow

These guidelines help work with agentic AI in this repository.

## Goals

- Make tasks reproducible (clear inputs, clear acceptance criteria)
- Limit scope to prevent unrelated refactors
- Keep changes minimal and consistent with existing patterns

## How to use

- Link the relevant feature doc(s) from `docs/features/**`.
- Provide explicit scope boundaries (allowed files).
- If requirements are ambiguous, ask questions before coding.

## Recommended rules

- The agent must not change code outside the allowed file list without asking.
- The agent must keep changes minimal and avoid stylistic refactors.
- The agent must ensure `type-check`, `lint`, and relevant tests pass.

## Reference docs

- Cross-cutting modules reference:
  - `docs/agent-reference.md`
- Feature docs index:
  - `docs/features/README.md`
