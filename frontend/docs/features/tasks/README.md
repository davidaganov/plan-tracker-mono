# Tasks

This document describes the `/tasks` page: what it shows, where data comes from, and which components participate in the flow.

## What `/tasks` is

`/tasks` is a section for planning household routines: small lists of tasks for a scenario (e.g. cleaning checklist, repair preparation).

Current implementation status:

- The UI structure is present.
- Domain data integration is not implemented yet (lists are currently an empty array in the page component).

## Entry points (routes)

- Routes: `src/router/mainRoutes.ts`

Base route:

- `/tasks` (`name: tasks`)
  - view: `src/views/TasksView.vue`

## Page composition

`TasksView.vue` is a thin wrapper around a page-level component:

- `src/views/TasksView.vue`
  - renders `src/components/pages/tasks/TasksPage.vue`

`TasksPage.vue` composes the page UI:

- Toolbar (filter + create): `src/components/pages/tasks/TasksToolbar.vue`
- Search input: `src/components/pages/tasks/TasksSearchField.vue`
- Lists grid: `src/components/pages/tasks/TasksLists.vue`

## UI behaviors

### List filter

`TasksPage.vue` uses `LIST_FILTER_TITLE_KEYS` from:

- `src/config/listFilters`

Filter values:

- `all`
- `family`
- `personal`

### List cards

`TasksLists.vue` renders each list card with:

- Title
- Scope badge:
  - `common.scopes.family` when `canSend === true`
  - `common.scopes.personal` otherwise
- Tasks count:
  - `units.tasks` with `{ count }`

Available actions:

- Open (`common.actions.open`)
- Send (only when `canSend === true`)

## Data sources

Current status:

- Tasks lists are declared in `TasksPage.vue` as `lists: []`.
- `onCreateList`, `onOpenList`, `onSendList` are empty handlers.

Expected future integration points (suggested):

- Store under `src/stores/**` responsible for tasks lists.
- Sending a list is expected to integrate with Telegram messaging once family sharing is implemented.

## Related docs

- Cross-cutting modules reference:
  - `docs/agent-reference.md`
