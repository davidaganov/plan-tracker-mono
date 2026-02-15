# Products

This document describes the `/products` section: what it contains, how the UI is composed, and how core shopping flows are implemented.

## What `/products` is

`/products` is the main domain page of the app. It is organized as a tabbed workspace for:

- **Lists** (shopping lists)
- **Catalog** (products)
- **Templates** (reusable sets / recipes)
- **Locations** (shops/places where products are bought)

A key interaction pattern in this section:

- `/products` remains mounted as the “base page”.
- Details screens (list/template) open as an overlay page via nested routes and `<RouterView/>` transition.

## Entry points (routes)

- Routes: `src/router/mainRoutes.ts`, `src/router/productsRoutes.ts`

Base route:

- `/products` (`name: products`)
  - view: `src/views/ProductsView.vue`

Nested overlay routes:

- `/products/templates/:id` (`name: template-details`)
  - view: `src/views/TemplateView.vue`
  - overlay implementation: `ProductsView.vue` renders nested route components in a fixed full-screen container.

- `/products/lists/:id` (`name: list-details`)
  - view: `src/views/ListView.vue`

## Page composition

### Base page (`ProductsView.vue`)

- `src/views/ProductsView.vue`
  - renders `ProductsPage` (tabbed workspace)
  - renders nested route overlays using `<RouterView v-slot>` + transition (`page-slide`).

### Workspace (`ProductsPage.vue`)

- `src/components/pages/products/ProductsPage.vue`

Main UI building blocks:

- Tabs UI: `src/components/ui/UiTabs.vue`
- Toolbar: `src/components/pages/products/ProductsToolbar.vue`

Tabs:

- Lists tab: `src/components/pages/products/tabs/TabLists.vue`
- Catalog tab: `src/components/pages/products/tabs/TabCatalog.vue`
- Templates tab: `src/components/pages/products/tabs/TabTemplates.vue`
- Locations tab: `src/components/pages/products/tabs/TabLocations.vue`

Create/delete actions are dispatched from `ProductsPage` to the active tab via a `TabRef` interface:

- `openCreateDrawer()`
- `deleteSelection()`
- `selectAll()`

## Data sources (stores) and responsibilities

### Locations

- Store: `src/stores/locations.ts`
- Requests: `src/services/requests/locations/**`

Used by:

- Locations tab (`TabLocations.vue`) for CRUD.
- Catalog product drawer (`CatalogDrawer.vue`) for selecting default locations of a product.

### Catalog (products)

- Store: `src/stores/catalog.ts`
- Requests: `src/services/requests/catalog/**`

Used by:

- Catalog tab (`TabCatalog.vue`) for CRUD + reorder.
- List details (`ListPage.vue`) and template details (`TemplatePage.vue`) to resolve product metadata and to allow “create product while adding to entity”.

### Templates

- Store: `src/stores/templates.ts`
- Requests: `src/services/requests/templates/**`

Used by:

- Templates tab (`TabTemplates.vue`) for CRUD + reorder.
- Template details overlay (`TemplatePage.vue`) for item-level operations.

### Lists

- Store: `src/stores/lists.ts`
- Requests: `src/services/requests/lists.ts`

Used by:

- Lists tab (`TabLists.vue`) for CRUD + reorder.
- List details overlay (`ListPage.vue`) for item-level operations, toggling, applying templates.

## Cross-cutting helpers and UI primitives

- Generic tab logic: `useEntityTab` (`src/composables/useEntityTab.ts`)
- Soft delete + undo: `useDeleteSnackbar` (`src/composables/useDeleteSnackbar.ts`)
- Drawer patterns:
  - `BaseEntityDrawer` (create/edit list/template metadata)
  - `CatalogDrawer` (create/edit product)
  - `LocationDrawer` (create/edit location)
  - `BaseProductsAddDrawer` (select products to add)

Cost calculation:

- Template cost: `calculateTemplateCost` (`src/utils/price.ts`)
- List cost: `calculateListCost` (`src/utils/price.ts`)

# Full cycle flows

This section describes end-to-end user workflows and where they are implemented.

## 1) Create a location

Entry point:

- Navigate to `/products`
- Open **Locations** tab
- Press **Create** in toolbar (handled by `ProductsPage.vue` -> `TabLocations.openCreateDrawer()`)

Implementation:

- UI: `TabLocations.vue` + `LocationDrawer.vue`
- Store action:
  - `useLocationsStore().createLocation(title, note)`
- Request:
  - `ApiClient.locations.create({ title, note })`

Notes:

- Locations are also loaded on-demand when opening `CatalogDrawer`.

## 2) Create a product (with optional location and price)

Entry point:

- Navigate to `/products`
- Open **Catalog** tab
- Press **Create** in toolbar (handled by `ProductsPage.vue` -> `TabCatalog.openCreateDrawer()`)

Implementation:

- UI: `TabCatalog.vue` + `CatalogDrawer.vue`
- Store action:
  - `useCatalogStore().createProduct(CreateProductDto)`

Notable fields:

- default locations: `defaultLocationIds` (MultiSelect powered by `useLocationsStore().locations`)
- quantity type:
  - regulated: `quantityUnit !== null`
  - unregulated: `quantityUnit === null`
- price type:
  - `PRICE_TYPE.EXACT` vs `PRICE_TYPE.RANGE`

Related behavior:

- If you create a product while an “add products” drawer is open in list/template overlay, the new product can be auto-selected:
  - `ListPage.vue` / `TemplatePage.vue` uses `addProductsDrawerRef.addProductToSelection(newProduct.id)` after `createProduct`.

## 3) Create a template and add products to it

A template is created in the Templates tab; its content (items) is managed on the details overlay.

### 3.1 Create template

Entry point:

- Navigate to `/products`
- Open **Templates** tab
- Press **Create** in toolbar

Implementation:

- UI: `TabTemplates.vue` + `BaseEntityDrawer`
- Store action:
  - `useTemplatesStore().createTemplate({ title, tags, note })`

### 3.2 Add products to template

Entry point:

- Open a template details page:
  - click template in Templates tab
  - or navigate to `/products/templates/:id`

Implementation:

- Overlay: `TemplatePage.vue`
- “Add products” drawer:
  - `BaseProductsAddDrawer` (opened via FAB)
- Store action:
  - `useTemplatesStore().addProductsToTemplate(templateId, productIds)`

Additional operations:

- Edit template metadata: `useTemplatesStore().updateTemplate(...)` via `BaseEntityDrawer`.
- Edit template item quantity/sort index: `useTemplatesStore().updateTemplateItem(...)` via `BaseItemEditDrawer` and drag end handler.
- Remove item(s):
  - single: `removeProductFromTemplate(templateId, itemId)`
  - multi-select: loops `Promise.all(removeProductFromTemplate(...))`

## 4) Create a list and populate it with products and templates

Lists are created in the Lists tab; items are managed on the list details overlay.

### 4.1 Create list

Entry point:

- Navigate to `/products`
- Open **Lists** tab
- Press **Create** in toolbar

Implementation:

- UI: `TabLists.vue` + `BaseEntityDrawer`
- Store action:
  - `useListsStore().createList(name, { tags, note })`

### 4.2 Add products to list

Entry point:

- Open list details page (`/products/lists/:id`)
- Press FAB **Create** -> opens `BaseProductsAddDrawer`

Implementation:

- Overlay: `ListPage.vue`
- Store action:
  - `useListsStore().addItem(listId, { productId, quantity })`

Additional operations:

- Toggle checked state:
  - optimistic UI flip in `ListPage.vue`
  - persisted via `useListsStore().toggleItem(listId, itemId, isChecked)`

- Apply templates:
  - open `TemplateSelectorDrawer`
  - apply via `useListsStore().applyTemplate(listId, templateIds)`

- Edit item quantity: `useListsStore().updateItem(...)`
- Delete item(s): `useListsStore().deleteItem(...)`
- Manual reordering:
  - drag is enabled when `list.sortMode === "manual" || !list.sortMode`
  - persisted by writing `sortIndex` via `updateItem` on drag end

## Known gaps / not implemented yet

- "Send list" action exists in list cards (`TabLists.vue` passes `@send` to `BaseEntityList`), but currently logs to console:
  - `onSendList(id) { console.log("Send list", id) }`

# Related docs

- Stores:
  - `docs/stores/catalog.md`
  - `docs/stores/locations.md`
  - `docs/stores/templates.md`
  - `docs/stores/lists.md`

- Services:
  - `docs/services/client.md`
  - `docs/services/request.md`
  - `docs/services/requests/README.md`

- Composables:
  - `docs/composables/useEntityTab.md`
  - `docs/composables/useDeleteSnackbar.md`

- Utils:
  - `docs/utils/price.md`
