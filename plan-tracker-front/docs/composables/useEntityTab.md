# `useEntityTab`

- **Source**: `src/composables/useEntityTab.ts`

## Purpose

Provide shared logic for entity “tabs” where you can:

- list entities
- filter by tags
- open item details or an edit drawer
- select items (bulk actions)
- soft-delete (hide) and hard-delete

The composable is store-agnostic via an adapter interface.

## Inputs

- `options: {
  router: Router
  routePrefix: string
  adapter: EntityStoreAdapter<T, TCreateData, TUpdateData>
  navigableItems?: boolean
}`

`adapter` must provide:

- `getItems(): T[]`
- `create(data)`
- `update(id, data)`
- `deleteMany(ids)`

Optional:

- `fetch()`
- `validate(data): boolean`

## Returns

State:

- `selectedIds: Ref<string[]>`
- `selectedTags: Ref<string[]>`
- `hiddenIds: Ref<string[]>`
- `isCreateDrawerOpen: Ref<boolean>`
- `items: ComputedRef<T[]>`
- `filteredItems: ComputedRef<T[]>`
- `editingEntity: ComputedRef<T | null>`
- `allTags: ComputedRef<string[]>`

Handlers:

- `handleCreate(data)`
- `handleUpdate(id, data)`
- `handleOpen(id, selectionMode)`
- `handleEdit(id)`
- `openCreateDrawer()`
- `selectAll()`
- `handleSelect(id)`
- `softDelete(ids)`
- `hardDelete(ids)`
- `undoDelete(ids)`

## Side effects

- Calls `router.push()` when `navigableItems === true`.
- Calls `adapter.fetch?.()` on mount.
- Uses a close delay to reset `editingId` after the drawer closes.

## Dependencies

- Vue `ref/computed/watch/onMounted`
- Router passed in
- Adapter passed in

## Usage

Each tab/page provides a small adapter mapping store operations to `useEntityTab`.

## Notes

- Soft delete is UI-only (items are hidden locally via `hiddenIds`).
- Hard delete must be implemented by the adapter and can be async.
