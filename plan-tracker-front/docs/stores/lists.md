# `lists` store

- **Source**: `src/stores/lists.ts`

## Purpose

Manage shopping lists and list items, including CRUD operations, sharing, and template application.

## State

- `items: Ref<ListDto[]>` - cached lists.
- `isLoading: Ref<boolean>` - loading flag for list fetch.
- `error: Ref<string | null>` - last error message.

## Actions

Lists:

- `fetchLists(): Promise<void>`
  - loads shopping lists: `ApiClient.lists.list({ type: LIST_TYPE.SHOPPING })`.
- `getListById(id: string): Promise<ListDto | null>`
  - loads a list by id.
- `createList(name: string, options?): Promise<ListDto>`
  - creates a new shopping list with default `sortMode` and `groupByLocations`.
- `updateList(id: string, data: UpdateListDto): Promise<ListDto>`
  - updates list and replaces it in local cache.
- `deleteList(id: string): Promise<void>`
  - deletes list and removes from cache.
- `deleteLists(ids: string[]): Promise<void>`
  - deletes multiple lists via `Promise.all(deleteList)`.
- `shareList(listId: string, familyId: string): Promise<void>`
- `unshareList(listId: string, familyId: string): Promise<void>`
  - both refresh the list collection via `fetchLists()` after server mutation.
- `reorderLists(orderedIds: string[]): Promise<{ ok: boolean }>`

Items:

- `fetchItems(listId: string): Promise<ShoppingItemDto[]>`
- `addItem(listId: string, data: CreateShoppingItemDto): Promise<ShoppingItemDto>`
  - defaults `quantity` to `1` when not provided.
- `updateItem(listId: string, itemId: string, data: UpdateShoppingItemDto): Promise<ShoppingItemDto>`
- `toggleItem(listId: string, itemId: string, isChecked: boolean): Promise<ShoppingItemDto>`
- `deleteItem(listId: string, itemId: string): Promise<void>`
- `applyTemplate(listId: string, templateIds: string[]): Promise<{ ok: boolean; created: number; updated: number }>`

## External dependencies

- API:
  - `ApiClient.lists` (`src/services/requests/lists.ts`)
- Types/enums:
  - `LIST_TYPE`, `LIST_SORT_MODE`
  - DTOs from `@plans-tracker/types`

## Error/loading strategy

- `fetchLists` toggles `isLoading`.
- Most mutation actions `throw` on error and expect callers to handle UI errors.

## Notes

- `shareList`/`unshareList` refresh the full list collection; if performance becomes an issue, consider partial local updates.
- `getListById` logs errors to console and returns `null` instead of throwing.
