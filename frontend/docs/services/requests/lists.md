# Lists requests

- **Source**: `src/services/requests/lists.ts`

## Purpose

Typed HTTP wrappers for shopping lists and their items.

## API

Lists:

- `list(params?: { type?: LIST_TYPE; familyId?: string }): Promise<ListDto[]>`
- `get(id: string): Promise<ListDto>`
- `create(data: CreateListDto): Promise<ListDto>`
- `update(id: string, data: UpdateListDto): Promise<ListDto>`
- `remove(id: string): Promise<unknown>`
- `share(id: string, familyId: string): Promise<unknown>`
- `unshare(id: string, familyId: string): Promise<unknown>`
- `reorder(orderedIds: string[]): Promise<{ ok: boolean }>`

Items:

- `listItems(listId: string): Promise<ShoppingItemDto[]>`
- `createItem(listId: string, data: CreateShoppingItemDto): Promise<ShoppingItemDto>`
- `updateItem(listId: string, itemId: string, data: UpdateShoppingItemDto): Promise<ShoppingItemDto>`
- `toggleItem(listId: string, itemId: string, isChecked: boolean): Promise<ShoppingItemDto>`
- `removeItem(listId: string, itemId: string): Promise<unknown>`
- `applyTemplates(listId: string, templateIds: string[]): Promise<{ ok: boolean; created: number; updated: number }>`
- `sendList(listId: string, payload: SendListDto): Promise<{ ok: boolean; sent: number }>`

## Dependencies

- `src/services/request.ts`
- DTOs/enums from `@plans-tracker/types`

## Notes

- All endpoints are under `/api/lists/**`.
- Family sharing APIs exist, but full UI integration may be incomplete depending on feature state.
- `sendList` is the likely integration point for “send list to family chat” flows.
