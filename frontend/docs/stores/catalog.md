# `catalog` store

- **Source**: `src/stores/catalog.ts`

## Purpose

Manage the personal products catalog state and synchronize it with the backend.

## State

- `products: Ref<ProductDto[]>` - cached list of products.
- `isLoading: Ref<boolean>` - loading flag for list fetch.
- `error: Ref<string | null>` - last error message.

## Actions

- `fetchProducts(): Promise<void>`
  - loads products via `ApiClient.catalog.list()`.
- `createProduct(payload: CreateProductDto): Promise<ProductDto>`
  - creates and pushes the returned product into local cache.
- `updateProduct(id: string, payload: UpdateProductDto): Promise<ProductDto>`
  - updates product on server and replaces it in local cache.
- `deleteProducts(ids: string[]): Promise<void>`
  - deletes products (currently loops with `Promise.all` calling single delete endpoint).
  - removes deleted ids from local cache.
- `reorderProducts(orderedIds: string[]): Promise<{ ok: boolean }>`
  - forwards to `ApiClient.catalog.reorder(orderedIds)`.

## External dependencies

- API:
  - `ApiClient.catalog` (`src/services/requests/catalog/index.ts`)
- Types:
  - `CreateProductDto`, `UpdateProductDto`, `ProductDto`

## Error/loading strategy

- `fetchProducts` toggles `isLoading`.
- Mutation actions set `error` and rethrow to allow UI to handle it.

## Notes

- `deleteProducts` assumes backend currently supports only single delete per product; bulk deletion is implemented client-side.
- `reorderProducts` does not update local order by itself; callers may need to optimistically reorder `products` in UI.
