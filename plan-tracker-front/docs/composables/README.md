# Composables documentation

This folder documents composables from `src/composables/**`.

## How to use these docs

- Prefer reading the composable doc before changing its implementation.
- Composables may have side effects (stores, router navigation, localStorage, events, timers).
- If you change a composable public API (params/return shape), update:
  - the composable doc page
  - all usages across the app

## Documentation template (for new composables)

Each composable doc should contain:

- **Source**: link/path to implementation under `src/composables/**`
- **Purpose**: one paragraph
- **Inputs**: parameters (types + meaning)
- **Returns**: returned refs/computed/functions
- **Side effects**: stores/router/localStorage/events/timers
- **Dependencies**: other composables/stores/utils/types
- **Usage**: minimal snippet(s)
- **Notes**: invariants / gotchas / performance

## Index

- `useAppSettings` -> `docs/composables/useAppSettings.md`
- `useDeleteSnackbar` -> `docs/composables/useDeleteSnackbar.md`
- `useEntityDetailsPage` -> `docs/composables/useEntityDetailsPage.md`
- `useEntityTab` -> `docs/composables/useEntityTab.md`
- `useSwipeToClose` -> `docs/composables/useSwipeToClose.md`
