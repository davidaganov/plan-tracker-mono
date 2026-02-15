# `useEntityDetailsPage`

- **Source**: `src/composables/useEntityDetailsPage.ts`

## Purpose

Shared orchestration logic for entity details pages that have items and multiple drawers.

It supports two entity types:

- `ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY`
- `ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY`

Responsibilities:

- load entity + items
- open/close drawers (edit entity, edit item, add products)
- update / remove items
- update entity metadata
- handle swipe-to-close gesture

## Inputs

- `options: {
  entityId: Ref<string>
  entityType: typeof ENTITY_TAB_CONFIG.LISTS.ENTITY_KEY | typeof ENTITY_TAB_CONFIG.TEMPLATES.ENTITY_KEY
  store: EntityDetailsStore<T, I>
  onClose: () => void
}`

`store` is an adapter interface. Only methods relevant to the entity type are required.

## Returns

State:

- `entity: Ref<T | null>`
- `items: Ref<I[]>`
- `isLoading: Ref<boolean>`
- Drawer flags:
  - `isItemEditDrawerOpen`, `isAddProductsDrawerOpen`, `isEntityEditDrawerOpen`
- `editingItem: Ref<I | null>`

Swipe-to-close:

- `containerRef: Ref<HTMLElement | null>`
- `containerStyle: ComputedRef<Record<string, string | undefined>>`
- `translateY`, `isDragging`
- `handleTouchStart`, `handleTouchMove`, `handleTouchEnd`

Actions:

- `loadEntity(): Promise<void>`
- `handleEditItem(item: I): void`
- `handleSaveItem(data: { quantity: number }): Promise<void>`
- `handleRemoveItem(itemId: string): Promise<void>`
- `handleUpdateEntity(id: string, data: EntityUpdateDto): Promise<void>`
- `openEditDrawer(): void`
- `openAddProductsDrawer(): void`

## Side effects

- Performs async store calls.
- Calls `onClose()` when the entity is not found or on load error.
- Logs errors to `console.error` on load failure.

## Dependencies

- `useSwipeToClose` (`src/composables/useSwipeToClose.ts`)
- Types/enums from `@plans-tracker/types`

## Usage

Used by list/template details pages to share consistent behaviors without duplicating switch/case logic in components.

## Notes

- `handleTouchStart` prevents swipe-to-close when the inner scroll container is not at the top (`.overflow-y-auto`).
- After mutating an item/entity, the composable reloads data via `loadEntity()` to ensure consistent state.
