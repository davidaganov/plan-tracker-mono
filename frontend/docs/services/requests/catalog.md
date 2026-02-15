# Catalog requests

- **Source**: `src/services/requests/catalog/index.ts`

## Purpose

Typed HTTP wrappers for product catalog operations.

## API

- `list(): Promise<ProductDto[]>`
- `create(payload: CreateProductDto): Promise<ProductDto>`
- `update(id: string, payload: UpdateProductDto): Promise<ProductDto>`
- `remove(id: string): Promise<{ success: boolean }>`
- `reorder(orderedIds: string[]): Promise<{ ok: boolean }>`

## Dependencies

- `src/services/request.ts`
- DTOs from `@plans-tracker/types`

## Notes

- Endpoints are under `/api/products/**`.
- `reorder` is implemented as `PUT /api/products/reorder` with `orderedIds` payload.
